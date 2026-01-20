/**
 * 관리자 계정 생성 스크립트
 * 
 * 사용법:
 * node scripts/create-admin.js <username> <password> [email]
 * 
 * 예시:
 * node scripts/create-admin.js admin admin123 admin@example.com
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법: node scripts/create-admin.js <username> <password> [email]');
    console.log('예시: node scripts/create-admin.js admin admin123 admin@example.com');
    process.exit(1);
  }

  const [username, password, email] = args;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`\n비밀번호 해시 생성됨: ${hashedPassword}\n`);

  // DB 연결 설정
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'ggglog',
    password: process.env.DB_PASSWORD || 'ggglog_password',
    database: process.env.DB_NAME || 'ggglog_as',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 관리자 추가 또는 업데이트
    const [result] = await connection.execute(
      `INSERT INTO admins (username, password, email) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE password = ?, email = ?`,
      [username, hashedPassword, email || null, hashedPassword, email || null]
    );

    console.log('관리자 계정이 생성/업데이트되었습니다.');
    console.log(`- 아이디: ${username}`);
    console.log(`- 이메일: ${email || '(없음)'}`);
    
    await connection.end();
  } catch (error) {
    console.error('DB 연결 실패:', error.message);
    console.log('\n해시만 출력합니다. 직접 DB에 INSERT하세요:');
    console.log(`INSERT INTO admins (username, password, email) VALUES ('${username}', '${hashedPassword}', ${email ? `'${email}'` : 'NULL'});`);
  }
}

createAdmin();
