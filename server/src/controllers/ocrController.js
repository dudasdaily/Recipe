const ocrService = require('../services/ocrService');
const { Receipt, ReceiptItem, User, sequelize } = require('../models');

/**
 * 영수증 OCR 컨트롤러
 */
class OCRController {
    /**
     * 영수증 이미지 분석 및 저장
     */
    async analyzeReceipt(req, res) {
        try {
            if (!req.file && !req.body.image) {
                return res.status(400).json({
                    success: false,
                    message: '이미지가 제공되지 않았습니다.'
                });
            }

            // 이미지 분석
            const image = req.file ? req.file.buffer : req.body.image;
            const result = await ocrService.analyzeReceipt(image);

            if (!result.success) {
                return res.status(400).json(result);
            }

            // 데이터베이스에 저장
            const receiptData = result.data;
            
            console.log('[OCR Controller] 받은 데이터:', {
                storeName: receiptData.storeName,
                purchaseDate: receiptData.purchaseDate,
                totalAmount: receiptData.totalAmount,
                itemsCount: receiptData.items?.length || 0,
                ingredientCount: receiptData.ingredientCount || 0
            });

            // 식재료가 하나도 감지되지 않은 경우 데이터베이스에 저장하지 않음
            if (!receiptData.items || receiptData.items.length === 0) {
                return res.json({
                    success: true,
                    message: '영수증에서 식재료를 찾을 수 없습니다. 다시 촬영해보세요.',
                    data: {
                        receipt: null,
                        items: [],
                        summary: {
                            totalItems: receiptData.originalItemCount || 0,
                            ingredientItems: 0,
                            filteredOut: receiptData.originalItemCount || 0
                        }
                    }
                });
            }
            
            // 트랜잭션 시작
            const transaction = await sequelize.transaction();

            try {
                // 기본 사용자가 없으면 생성
                let defaultUser = await User.findByPk(1);
                if (!defaultUser) {
                    defaultUser = await User.create({
                        id: 1,
                        email: 'default@recipe.app',
                        password: 'default123',
                        name: '기본 사용자'
                    }, { transaction });
                    console.log('기본 사용자가 생성되었습니다.');
                }

                // 영수증 정보 저장 - 기본 사용자 ID 1 사용
                const receipt = await Receipt.create({
                    store_name: receiptData.storeName || '미확인',
                    purchase_date: receiptData.purchaseDate || new Date(),
                    total_amount: receiptData.totalAmount || 0,
                    receipt_image_url: req.file?.path || null,
                    user_id: 1 // 기본 사용자 ID 사용
                }, { transaction });

                // 영수증 항목들 저장 - snake_case 필드명 사용
                const receiptItems = await Promise.all(
                    receiptData.items.map(item => 
                        ReceiptItem.create({
                            receipt_id: receipt.id,
                            ingredient_id: null, // 나중에 실제 재료로 매핑할 때 설정
                            name: item.name,
                            quantity: item.quantity || 1,
                            unit: item.unit || '개',
                            price: item.price || 0
                        }, { transaction })
                    )
                );

                await transaction.commit();

                // 필터링 결과에 따른 메시지 생성
                let message = '영수증이 성공적으로 처리되었습니다.';
                if (receiptData.originalItemCount > receiptData.ingredientCount) {
                    message += ` 전체 ${receiptData.originalItemCount}개 상품 중 ${receiptData.ingredientCount}개의 식재료가 감지되었습니다.`;
                } else {
                    message += ` ${receiptData.ingredientCount}개의 식재료가 감지되었습니다.`;
                }

                return res.json({
                    success: true,
                    message,
                    data: {
                        receipt,
                        items: receiptItems,
                        summary: {
                            totalItems: receiptData.originalItemCount,
                            ingredientItems: receiptData.ingredientCount,
                            filteredOut: receiptData.originalItemCount - receiptData.ingredientCount
                        }
                    }
                });

            } catch (error) {
                await transaction.rollback();
                throw error;
            }

        } catch (error) {
            console.error('영수증 처리 중 오류:', error);
            return res.status(500).json({
                success: false,
                message: '영수증 처리 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 저장된 영수증 조회
     */
    async getReceipt(req, res) {
        try {
            const { id } = req.params;

            // 영수증 정보와 항목들을 함께 조회
            const receipt = await Receipt.findByPk(id, {
                include: [{
                    model: ReceiptItem,
                    as: 'items'
                }]
            });

            if (!receipt) {
                return res.status(404).json({
                    success: false,
                    message: '영수증을 찾을 수 없습니다.'
                });
            }

            return res.json({
                success: true,
                data: receipt
            });

        } catch (error) {
            console.error('영수증 조회 중 오류:', error);
            return res.status(500).json({
                success: false,
                message: '영수증 조회 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = new OCRController(); 