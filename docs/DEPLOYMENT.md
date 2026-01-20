# 배포 가이드

## 목차
1. [사전 준비](#1-사전-준비)
2. [MariaDB Docker 설정](#2-mariadb-docker-설정)
3. [Next.js 앱 Docker 설정](#3-nextjs-앱-docker-설정)
4. [nginx 설치 및 설정](#4-nginx-설치-및-설정)
5. [Let's Encrypt SSL 설정](#5-lets-encrypt-ssl-설정)
6. [최종 확인](#6-최종-확인)

---

## 1. 사전 준비

### 서버 요구사항
- Ubuntu 20.04 LTS 이상
- 최소 2GB RAM
- Docker & Docker Compose 설치

### Docker 설치 (Ubuntu)
```bash
# 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 설치 확인
docker --version
docker-compose --version
```

---

## 2. MariaDB Docker 설정

### 2.1 프로젝트 업로드
```bash
# 프로젝트 디렉토리 생성
mkdir -p /home/$USER/ggglog_as
cd /home/$USER/ggglog_as

# 프로젝트 파일 업로드 (git clone 또는 scp)
git clone https://github.com/your-repo/ggglog_as.git .
# 또는
# scp -r ./ggglog_as user@server:/home/$USER/
```

### 2.2 환경변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

**.env 파일 내용:**
```env
# Database
DB_HOST=db
DB_PORT=3306
DB_USER=ggglog
DB_PASSWORD=안전한_비밀번호_입력
DB_NAME=ggglog_as
DB_ROOT_PASSWORD=루트_비밀번호_입력

# JWT
JWT_SECRET=32자_이상의_랜덤_문자열_입력

# Admin Email
ADMIN_EMAIL=admin@yourdomain.com

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=앱_비밀번호_입력
SMTP_FROM=공간기록 A/S센터 <your_email@gmail.com>

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2.3 Docker Compose로 DB만 먼저 실행
```bash
# MariaDB만 먼저 실행
docker-compose up -d db

# 로그 확인
docker-compose logs -f db
```

### 2.4 DBeaver로 DB 접속 및 테이블 생성
1. DBeaver에서 새 연결 생성
   - Host: 서버 IP
   - Port: 3306
   - Database: ggglog_as
   - User: ggglog
   - Password: .env에 설정한 비밀번호

2. `init.sql` 파일 내용 실행하여 테이블 생성

### 2.5 관리자 계정 생성
```bash
# 로컬에서 비밀번호 해시 생성 (또는 서버에서)
node scripts/create-admin.js admin your_password admin@example.com

# 출력된 SQL을 DBeaver에서 실행
```

---

## 3. Next.js 앱 Docker 설정

### 3.1 앱 빌드 및 실행
```bash
# 전체 서비스 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f app
```

### 3.2 컨테이너 상태 확인
```bash
docker-compose ps

# 예상 출력:
# NAME          COMMAND                  SERVICE   STATUS   PORTS
# ggglog-app    "node server.js"         app       Up       0.0.0.0:3000->3000/tcp
# ggglog-db     "docker-entrypoint.s…"   db        Up       0.0.0.0:3306->3306/tcp
```

---

## 4. nginx 설치 및 설정

### 4.1 nginx 설치
```bash
sudo apt install nginx -y

# 상태 확인
sudo systemctl status nginx
```

### 4.2 nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/ggglog
```

**nginx 설정 내용:**
```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt 인증용
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 설정 (SSL 인증서 발급 후 활성화)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name yourdomain.com www.yourdomain.com;
# 
#     # SSL 인증서 (certbot이 자동 설정)
#     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
#     include /etc/letsencrypt/options-ssl-nginx.conf;
#     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
# 
#     # 파일 업로드 크기 제한
#     client_max_body_size 50M;
# 
#     # Next.js 리버스 프록시
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         
#         # 타임아웃 설정
#         proxy_connect_timeout 60s;
#         proxy_send_timeout 60s;
#         proxy_read_timeout 60s;
#     }
# }
```

### 4.3 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/ggglog /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# nginx 재시작
sudo systemctl restart nginx
```

---

## 5. Let's Encrypt SSL 설정

### 5.1 Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 SSL 인증서 발급
```bash
# 인증서 발급 (자동으로 nginx 설정도 수정)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 이메일 입력, 약관 동의 등 진행
```

### 5.3 자동 갱신 확인
```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run

# systemd timer 확인
sudo systemctl status certbot.timer
```

### 5.4 자동 갱신 cron 설정 (선택사항)
```bash
# crontab 편집
sudo crontab -e

# 매일 새벽 3시에 갱신 체크
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## 6. 최종 확인

### 6.1 서비스 상태 확인
```bash
# Docker 컨테이너 상태
docker-compose ps

# nginx 상태
sudo systemctl status nginx

# 포트 확인
sudo netstat -tlnp | grep -E '80|443|3000|3306'
```

### 6.2 웹사이트 접속 테스트
```bash
# HTTP 리다이렉트 확인
curl -I http://yourdomain.com

# HTTPS 접속 확인
curl -I https://yourdomain.com
```

### 6.3 SSL 인증서 확인
```bash
# 인증서 상태 확인
sudo certbot certificates

# 브라우저에서 https://yourdomain.com 접속하여 자물쇠 아이콘 확인
```

---

## 문제 해결

### Docker 관련
```bash
# 컨테이너 로그 확인
docker-compose logs -f app
docker-compose logs -f db

# 컨테이너 재시작
docker-compose restart app

# 전체 재빌드
docker-compose down
docker-compose up -d --build
```

### nginx 관련
```bash
# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx
```

### 방화벽 설정 (UFW)
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

---

## 업데이트 배포

```bash
cd /home/$USER/ggglog_as

# 최신 코드 가져오기
git pull origin main

# 앱 재빌드 및 재시작
docker-compose up -d --build app

# 로그 확인
docker-compose logs -f app
```
