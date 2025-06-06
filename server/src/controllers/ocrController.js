const ocrService = require('../services/ocrService');
const { Receipt, ReceiptItem, sequelize } = require('../../models');

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
                    error: '이미지가 제공되지 않았습니다.'
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
            
            // 트랜잭션 시작
            const transaction = await sequelize.transaction();

            try {
                // 영수증 정보 저장
                const receipt = await Receipt.create({
                    storeName: receiptData.storeName,
                    purchaseDate: receiptData.purchaseDate,
                    totalAmount: receiptData.totalAmount,
                    imageUrl: req.file?.path || null,
                    userId: req.user?.id || null // 사용자 ID가 있는 경우에만 저장
                }, { transaction });

                // 영수증 항목들 저장
                const receiptItems = await Promise.all(
                    receiptData.items.map(item => 
                        ReceiptItem.create({
                            receiptId: receipt.id,
                            name: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            price: item.price
                        }, { transaction })
                    )
                );

                await transaction.commit();

                return res.json({
                    success: true,
                    message: '영수증이 성공적으로 처리되었습니다.',
                    data: {
                        receipt,
                        items: receiptItems
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
                error: '영수증 처리 중 오류가 발생했습니다.'
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
                    error: '영수증을 찾을 수 없습니다.'
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
                error: '영수증 조회 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = new OCRController(); 