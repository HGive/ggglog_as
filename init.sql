-- GGGLog A/S 시스템 데이터베이스 스키마
-- MariaDB 10.11+

-- 데이터베이스 선택 (docker-compose에서 자동 생성됨)
USE ggglog_as;

-- 문자셋 설정
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ======================================
-- 1. applications 테이블 (A/S 신청)
-- ======================================
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '신청자 성함',
    phone VARCHAR(20) NOT NULL COMMENT '연락처',
    email VARCHAR(100) NOT NULL COMMENT '이메일',
    address VARCHAR(255) NOT NULL COMMENT '현장주소',
    completion_year VARCHAR(10) NOT NULL COMMENT '완공년도',
    site_manager VARCHAR(50) DEFAULT NULL COMMENT '당시 현장소장',
    designer VARCHAR(50) DEFAULT NULL COMMENT '당시 담당 디자이너',
    title VARCHAR(200) NOT NULL COMMENT 'A/S 신청 제목',
    content TEXT NOT NULL COMMENT 'A/S 신청 내용',
    status VARCHAR(20) NOT NULL DEFAULT '01' COMMENT '진행상황 (01:신청, 02:접수완료, 03:담당자 배정, 04:일정 조율 중, 05:A/S 완료, 06:처리완료)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '신청일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    
    INDEX idx_name_phone (name, phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='A/S 신청 테이블';

-- ======================================
-- 2. attachments 테이블 (첨부파일)
-- ======================================
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL COMMENT '신청 ID',
    file_name VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '저장 경로',
    file_size INT NOT NULL COMMENT '파일 크기 (bytes)',
    mime_type VARCHAR(100) DEFAULT NULL COMMENT 'MIME 타입',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='첨부파일 테이블';

-- ======================================
-- 3. admins 테이블 (관리자)
-- ======================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '아이디',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (bcrypt 해시)',
    email VARCHAR(100) DEFAULT NULL COMMENT '이메일',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 테이블';

-- ======================================
-- 초기 관리자 계정 생성
-- 기본 비밀번호: admin123
-- ⚠️ 실제 운영 시 반드시 변경하세요!
-- ======================================
INSERT INTO admins (username, password, email) VALUES 
('admin', '$2a$10$NM5GvCI7bt8bDm4vAEBgoeVCJhhlS.o36SEMHoIuzMDHFMVw2QQoC', 'skyjoon34@naver.com')
ON DUPLICATE KEY UPDATE username = username;

-- ======================================
-- 관리자 비밀번호 변경 방법:
-- 1. 로컬에서 해시 생성:
--    node -e "require('bcryptjs').hash('새비밀번호', 10).then(console.log)"
-- 2. DB에서 업데이트:
--    UPDATE admins SET password='생성된해시' WHERE username='admin';
-- ======================================
