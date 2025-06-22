const { sequelize } = require('./src/models');

async function fixUsersTable() {
  try {
    console.log('데이터베이스에 연결 중...');
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    // 1. users 테이블 백업 (데이터가 있는 경우)
    console.log('1. users 테이블 데이터 백업 중...');
    const [users] = await sequelize.query('SELECT * FROM users WHERE 1=1');
    console.log(`백업할 사용자 수: ${users.length}`);

    // 2. 외래키 제약 조건 비활성화
    console.log('2. 외래키 제약 조건 비활성화 중...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 3. users 테이블 삭제
    console.log('3. users 테이블 삭제 중...');
    await sequelize.query('DROP TABLE IF EXISTS users');
    console.log('users 테이블 삭제 완료');

    // 4. 테이블 재생성
    console.log('4. users 테이블 재생성 중...');
    await sequelize.query(`
      CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('users 테이블 재생성 완료');

    // 5. 외래키 제약 조건 다시 활성화
    console.log('5. 외래키 제약 조건 활성화 중...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // 6. 백업된 데이터 복원
    if (users.length > 0) {
      console.log('6. 백업 데이터 복원 중...');
      for (const user of users) {
        await sequelize.query(
          'INSERT INTO users (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          {
            replacements: [user.id, user.email, user.password, user.name, user.createdAt, user.updatedAt]
          }
        );
      }
      console.log('백업 데이터 복원 완료');
    }

    console.log('users 테이블 수정 작업 완료!');
    console.log('이제 서버를 다시 시작할 수 있습니다.');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await sequelize.close();
  }
}

fixUsersTable(); 