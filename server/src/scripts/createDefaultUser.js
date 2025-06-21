const { User } = require('../models');

async function createDefaultUser() {
    try {
        // 기본 사용자가 이미 존재하는지 확인
        const existingUser = await User.findByPk(1);
        
        if (!existingUser) {
            // 기본 사용자 생성
            await User.create({
                id: 1,
                email: 'default@recipe.app',
                password: 'default123', // 실제 운영에서는 해시된 비밀번호 사용
                name: '기본 사용자'
            });
            console.log('기본 사용자가 생성되었습니다.');
        } else {
            console.log('기본 사용자가 이미 존재합니다.');
        }
    } catch (error) {
        console.error('기본 사용자 생성 중 오류:', error);
    }
}

// 스크립트 직접 실행 시
if (require.main === module) {
    createDefaultUser().then(() => {
        process.exit(0);
    });
}

module.exports = createDefaultUser; 