# PRD (Product Requirements Document)
## GGGLog A/S 신청 시스템

---

## 1. 개요

### 1.1 프로젝트 목적
건축 완공 후 A/S(After Service) 신청 및 관리를 위한 웹 기반 시스템 구축

### 1.2 주요 목표
- 고객이 간편하게 A/S를 신청할 수 있는 환경 제공
- 신청 내역 조회 및 진행 상황 실시간 확인
- 관리자의 효율적인 A/S 요청 관리
- 리빙 가이드를 통한 셀프 A/S 정보 제공

### 1.3 기술 스택 (확정)
| 구분 | 기술 |
|------|------|
| Frontend/Backend | Next.js 14 (App Router) |
| Database | MariaDB 10.11 (Docker) |
| Web Server | nginx (호스트 설치) |
| SSL | Let's Encrypt + Certbot |
| 인증 | JWT (jose 라이브러리) |
| 비밀번호 해싱 | bcryptjs |
| 이메일 | Nodemailer (SMTP) |
| 폰트 | Pretendard |
| 컨테이너 | Docker + Docker Compose |

---

## 2. 사용자 유형

### 2.1 일반 사용자 (고객)
- A/S 신청
- 본인 신청 내역 조회
- 리빙 가이드 열람

### 2.2 관리자
- 전체 A/S 신청 목록 조회 및 검색
- 진행 상황 업데이트

---

## 3. 기능 요구사항

### 3.1 공통 - 헤더
| 항목 | 설명 |
|------|------|
| 위치 | 모든 페이지 상단 고정 |
| 좌측 | 로고 "ㄱㄱㄱ트" (클릭 시 홈으로 이동) |
| 우측 | 햄버거 메뉴 버튼 (홈, 신청하기, 신청조회하기, 가이드 페이지 이동버튼) |

### 3.2 공통 - 푸터
| 항목 | 설명 |
|------|------|
| 위치 | 모든 페이지 하단 |
| 내용 | "epilogue" 필기체 로고 + "완공 후의 이야기, 공간기록 애프터서비스 센터" |

---

### 3.3 메인 페이지 (홈)

**경로:** `/`

**구성 요소:**
1. "epilogue" 필기체 로고
2. "완공 후의 이야기, 공간기록 애프터서비스 센터" 텍스트
3. **A/S 신청하기** 버튼 → A/S 신청 페이지로 이동
4. **A/S 신청 조회하기** 버튼 → 신청 조회 페이지로 이동
5. **리빙가이드** 버튼 → 리빙 가이드 페이지로 이동

---

### 3.4 A/S 신청

**경로:** `/apply`

#### 3.4.1 신청 폼 필드

| 필드명 | 타입 | 필수 여부 | 비고 |
|--------|------|-----------|------|
| 성함 | Text | 필수 | |
| 연락처 | Text | 필수 | 전화번호 형식 |
| 이메일 | Email | 필수 | 진행상황 알림 수신용 |
| 현장주소 | Text | 필수 | |
| 완공년도 | Text | 필수 | |
| 담당 현장소장 | Text | 선택 | |
| 담당 디자이너 | Text | 선택 | |
| A/S 신청내용 - 제목 | Text | 필수 | |
| A/S 신청내용 - 내용 | Textarea | 필수 | 상세 내용 기술 |
| 사진첨부 | File | 필수 | 다중 업로드 지원, 파일당 최대 50MB |

#### 3.4.2 하단 버튼
- **취소** 버튼: 홈으로 이동
- **신청하기** 버튼: 폼 제출

#### 3.4.3 신청 후 처리
- 관리자 이메일로 알림 발송
- 최초 진행상태: `신청`
- `/apply/complete` 페이지로 이동

#### 3.4.4 신청 완료 페이지

**경로:** `/apply/complete`

**내용:**
- "접수 처리 되었습니다."
- "담당자 배정까지 영업일 기준 2일 정도 소요됩니다."
- "건축주님들의 불편을 덜어드릴 수 있게 빠르게 연락드리겠습니다."
- A/S 신청 조회하기, 리빙가이드 버튼

#### 3.4.5 진행 상태 단계
```
신청 → 접수완료 → 담당자 배정 → 일정 조율 중 → A/S 완료 → 처리완료
```

---

### 3.5 신청 조회

**경로:** `/search`

#### 3.5.1 조회 인증
| 필드명 | 타입 | 필수 여부 |
|--------|------|-----------|
| 성함 | Text | 필수 |
| 연락처 | Text | 필수 |

**버튼:**
- **취소** 버튼: 홈으로 이동
- **조회하기** 버튼: 입력 정보로 신청 목록 조회

#### 3.5.2 신청 목록 페이지

**경로:** `/search/list`

**목록 구성:**
- "OOO 건축주님의 에필로그_" 제목
- 레이아웃: 테이블 형태 (제목, 날짜, 진행상황)
- 페이지네이션: 없음 (전체 목록 스크롤)

**인터랙션:**
- 목록 아이템 클릭 시 상세 페이지로 이동

#### 3.5.3 신청 상세 페이지

**경로:** `/search/detail`

**기능:**
- 진행상태 스테퍼 표시
- 신청 내용 전체 표시 (읽기 전용, 수정 불가)
- 첨부파일 클릭 시 다운로드

---

### 3.6 리빙 가이드

**경로:** `/guide`

#### 3.6.1 콘텐츠 구성
- "living guide" 필기체 제목
- 검색 입력창
- "집짓기 관리의 모든것, 무엇이 궁금하세요?" 텍스트
- 건축주 셀프 A/S 대처 방법
- A/S 가능 항목 안내
- A/S 기간 안내
- 계절별 주거 관리 팁
- 긴급 상황 대처

#### 3.6.2 검색 기능
| 기능 | 설명 |
|------|------|
| 검색 입력창 | 상단 고정 |
| 검색 방식 | 키워드 입력 시 해당 위치로 스크롤 이동 |
| 하이라이트 | 검색된 키워드 노란색 배경으로 강조 |
| 이전/다음 | 여러 매치 결과 간 이동 |
| 동작 | Ctrl+F 기능과 유사 |

#### 3.6.3 향후 확장 계획
- AI 기반 검색 기능
- AI 챗봇을 통한 질의응답

---

### 3.7 관리자 페이지

**경로:** `/admin` (비공개 - 직접 URL 접근만 가능, 입력 시 `/admin/login`으로 리디렉션)

#### 3.7.1 로그인

**경로:** `/admin/login`

| 필드명 | 타입 | 필수 여부 |
|--------|------|-----------|
| 아이디 | Text | 필수 |
| 비밀번호 | Password | 필수 |

**인증 방식:** JWT 기반 인증 (24시간 유효)

#### 3.7.2 관리자 대시보드

**경로:** `/admin/dashboard`

**기능:**
- 전체 A/S 신청 목록 조회 (테이블 형태)
- 검색 및 필터 기능
- 로그아웃 버튼

**검색 필터:**
| 필터 | 설명 |
|------|------|
| 이름 | 신청자 성함으로 검색 |
| 연락처 | 신청자 연락처로 검색 |
| 제목 | 신청 제목으로 검색 |
| 시작일/종료일 | 신청 날짜 범위로 검색 |

#### 3.7.3 관리자 상세 페이지

**경로:** `/admin/detail`

**기능:**
- 신청 정보 전체 조회
- 진행상태 스테퍼 표시
- **진행상황 수정** (유일하게 수정 가능한 항목)
- 첨부파일 다운로드
- 목록으로 돌아가기 버튼

---

### 3.8 알림 기능

#### 3.8.1 관리자 알림
| 트리거 | 알림 대상 | 알림 방식 |
|--------|----------|----------|
| 새로운 A/S 신청 | 관리자 이메일 | SMTP |

#### 3.8.2 사용자 알림
| 트리거 | 알림 대상 | 알림 방식 |
|--------|----------|----------|
| 진행상황 변경 | 신청자 이메일 | SMTP |

#### 3.8.3 향후 확장 계획
- SMS 알림
- 카카오톡 알림톡

---

## 4. 데이터베이스 설계

### 4.1 테이블 구조

#### applications (A/S 신청)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| name | VARCHAR(50) | 성함 |
| phone | VARCHAR(20) | 연락처 |
| email | VARCHAR(100) | 이메일 |
| address | VARCHAR(255) | 현장주소 |
| completion_year | VARCHAR(10) | 완공년도 |
| site_manager | VARCHAR(50) | 당시 현장소장 |
| designer | VARCHAR(50) | 당시 담당 디자이너 |
| title | VARCHAR(200) | 제목 |
| content | TEXT | A/S 신청 내용 |
| status | VARCHAR(20) | 진행상황 (기본값: '신청') |
| created_at | DATETIME | 신청일시 |
| updated_at | DATETIME | 수정일시 |

**인덱스:**
- `idx_name_phone (name, phone)` - 조회용
- `idx_status (status)` - 상태 필터용
- `idx_created_at (created_at)` - 정렬용

#### attachments (첨부파일)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| application_id | INT (FK) | 신청 ID |
| file_name | VARCHAR(255) | 원본 파일명 |
| file_path | VARCHAR(500) | 저장 경로 |
| file_size | INT | 파일 크기 (bytes) |
| mime_type | VARCHAR(100) | MIME 타입 |
| created_at | DATETIME | 업로드일시 |

#### admins (관리자)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| username | VARCHAR(50) UNIQUE | 아이디 |
| password | VARCHAR(255) | 비밀번호 (bcrypt 해시) |
| email | VARCHAR(100) | 이메일 |
| created_at | DATETIME | 생성일시 |

---

## 5. API 설계

### 5.1 신청 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/applications` | 신청 등록 |
| GET | `/api/applications` | 목록 조회 (성함+연락처 필수) |
| GET | `/api/applications/[id]` | 상세 조회 |

### 5.2 파일 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/files/[id]` | 파일 다운로드 |

### 5.3 관리자 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/admin/login` | 로그인 |
| POST | `/api/admin/logout` | 로그아웃 |
| GET | `/api/admin/applications` | 전체 목록 조회 |
| GET | `/api/admin/applications/[id]` | 상세 조회 |
| PATCH | `/api/admin/applications/[id]` | 진행상황 수정 |

---

## 6. 비기능 요구사항

### 6.1 보안
- ✅ 관리자 비밀번호 해싱 (bcryptjs)
- ✅ JWT 기반 인증
- ✅ SQL Injection 방지 (Prepared Statements)
- ✅ XSS 방지
- ✅ 파일 업로드 검증 (크기 제한 50MB)

### 6.2 성능
- ✅ Next.js standalone 빌드
- ✅ DB 인덱싱

### 6.3 반응형
- ✅ 모바일 우선 설계
- ✅ 태블릿, 데스크톱 대응

---

## 7. 인프라 구성

### 7.1 아키텍처
```
[클라이언트] → [nginx (SSL:443)] → [Next.js (Docker:3000)] → [MariaDB (Docker:3306)]
                     ↑
               [Certbot]
```

### 7.2 Docker 구성
- `ggglog-app`: Next.js 앱 컨테이너
- `ggglog-db`: MariaDB 컨테이너
- 볼륨: `mariadb_data`, `uploads`

### 7.3 nginx + SSL
- 호스트에 nginx 직접 설치
- Let's Encrypt + Certbot으로 무료 SSL
- 자동 갱신 (systemd timer)

---

## 8. 프로젝트 구조

```
ggglog_as/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/
│   │   │   ├── files/
│   │   │   └── admin/
│   │   ├── admin/
│   │   ├── apply/
│   │   ├── search/
│   │   ├── guide/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Stepper.tsx
│   │   ├── FileUpload.tsx
│   │   └── Loading.tsx
│   └── lib/
│       ├── db.ts
│       ├── auth.ts
│       └── email.ts
├── docs/
│   └── DEPLOYMENT.md
├── scripts/
│   └── create-admin.js
├── uploads/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf.example
├── init.sql
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── PRD.md
```

---

## 9. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 0.1 | 2026-01-15 | 초안 작성 |
| 1.0 | 2026-01-20 | 구현 완료, 기술 스택 확정, 인프라 구성 추가 |

---

## 10. 완료 사항

- [x] 프론트엔드 프레임워크: Next.js 14
- [x] 파일 업로드 저장소: 로컬 (Docker 볼륨)
- [x] 관리자 계정 생성: 스크립트 제공 (`scripts/create-admin.js`)
- [x] 화면 정의서 반영
- [x] 배포 가이드 작성 (`docs/DEPLOYMENT.md`)
