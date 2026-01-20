# GGGLog A/S 신청 시스템

공간기록 애프터서비스 센터 - 건축 완공 후 A/S 신청 및 관리 시스템

## 기능

### 고객
- A/S 신청 (사진 첨부 포함)
- 신청 내역 조회 (성함 + 연락처로 인증)
- 진행 상황 확인
- 리빙 가이드 열람

### 관리자
- 전체 신청 목록 조회 및 검색
- 진행 상황 수정
- 이메일 알림 자동 발송

## 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: MariaDB 10.11
- **Container**: Docker + Docker Compose
- **Web Server**: nginx
- **SSL**: Let's Encrypt + Certbot
- **Font**: Pretendard

## 시작하기

### 개발 환경

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

### Docker 실행 (개발/테스트)

```bash
# MariaDB만 실행
docker-compose up -d db

# 전체 실행
docker-compose up -d --build
```

## 배포

자세한 배포 가이드는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 참조

### 요약

1. 서버에 Docker, Docker Compose 설치
2. 프로젝트 업로드 및 `.env` 설정
3. `docker-compose up -d --build`
4. nginx 설치 및 설정
5. Certbot으로 SSL 인증서 발급

## 환경변수

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=ggglog
DB_PASSWORD=your_password
DB_NAME=ggglog_as

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Admin Email
ADMIN_EMAIL=admin@example.com

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=공간기록 A/S센터 <your_email@gmail.com>

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 관리자 계정 생성

```bash
node scripts/create-admin.js admin your_password admin@example.com
```

## 프로젝트 구조

```
src/
├── app/
│   ├── api/          # API Routes
│   ├── admin/        # 관리자 페이지
│   ├── apply/        # 신청 페이지
│   ├── search/       # 조회 페이지
│   └── guide/        # 가이드 페이지
├── components/       # 공통 컴포넌트
└── lib/              # 유틸리티 (DB, Auth, Email)
```

## 라이센스

Private
