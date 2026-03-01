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
| Language | TypeScript 5.3.0 |
| Database | MariaDB 10.11 (Docker) |
| Web Server | nginx (호스트 설치) |
| SSL | Let's Encrypt + Certbot |
| 인증 | JWT (jose 5.2.0) |
| 비밀번호 해싱 | bcryptjs 2.4.3 |
| 이메일 | Nodemailer 6.9.0 (SMTP) |
| 이미지 압축 | browser-image-compression 2.0.2 (클라이언트 사이드) |
| 파일 명명 | uuid 13.0.0 |
| 폰트 | Pretendard (본문), Epilogue (필기체 장식) |
| 스타일 | Tailwind CSS 3.4.1 |
| 컨테이너 | Docker + Docker Compose |

---

## 2. 사용자 유형

### 2.1 일반 사용자 (고객)
- A/S 신청
- 본인 신청 내역 조회 (성함 + 연락처 인증)
- 리빙 가이드 열람

### 2.2 관리자
- 전체 A/S 신청 목록 조회 및 검색
- 진행 상황 업데이트
- 신청 첨부파일(이미지) 조회

---

## 3. 기능 요구사항

### 3.1 공통 - 헤더

| 항목 | 설명 |
|------|------|
| 위치 | 모든 페이지 상단 고정 (sticky, z-50) |
| 좌측 | 로고 "ㄱㄱㄱ트" (클릭 시 홈으로 이동) |
| 우측 | 햄버거 메뉴 버튼 → 전체화면 오버레이 메뉴 (홈, 신청하기, 신청조회하기, 가이드 페이지 이동버튼) |
| 관리자 헤더 | `/admin/*` 경로에서는 로그아웃 버튼 표시 |

### 3.2 공통 - 푸터

| 항목 | 설명 |
|------|------|
| 위치 | 페이지 하단 (홈 페이지, 관리자 페이지에서는 숨겨짐) |
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

| 필드명 | 타입 | 필수 여부 | 글자수 제한 | 비고 |
|--------|------|-----------|-------------|------|
| 성함 | Text | 필수 | 10자 | |
| 연락처 | Text | 필수 | - | 010-XXXX-XXXX 형식, 자동 하이픈 삽입 |
| 이메일 | Email | 필수 | - | 진행상황 알림 수신용 |
| 현장주소 | Text | 필수 | 100자 | |
| 완공년도 | Text | 필수 | 4자리 숫자 | 숫자만 입력 가능 |
| 담당 현장소장 | Text | 선택 | 20자 | |
| 담당 디자이너 | Text | 선택 | 20자 | |
| A/S 신청내용 - 제목 | Text | 필수 | 50자 | |
| A/S 신청내용 - 내용 | Textarea | 필수 | 1000자 | 실시간 글자수 카운터 표시 |
| 사진첨부 | File | 필수 | - | 다중 업로드 지원, 1~10개, 파일당 최대 5MB |

**파일 업로드 제약:**
- 허용 타입: jpg, jpeg, png, gif, webp, bmp, heic, heif (이미지만)
- 파일당 최대 크기: 5MB
- 최대 파일 수: 10개
- 클라이언트 자동 압축: 1MB 초과 파일은 최대 1MB / 1920px 해상도로 자동 압축 (압축 실패 시 원본 사용)
- 드래그 앤 드롭 또는 클릭 업로드 지원

#### 3.4.2 하단 버튼
- **취소** 버튼: 홈으로 이동
- **신청하기** 버튼: 폼 제출

#### 3.4.3 신청 후 처리
- 관리자 이메일로 알림 발송 (비동기 - API 응답 차단 없음)
- 최초 진행상태: `01` (신청)
- `/apply/complete` 페이지로 이동

#### 3.4.4 신청 완료 페이지

**경로:** `/apply/complete`

**내용:**
- "접수 처리 되었습니다."
- "담당자 배정까지 영업일 기준 2일 정도 소요됩니다."
- "건축주님들의 불편을 덜어드릴 수 있게 빠르게 연락드리겠습니다."
- A/S 신청 조회하기, 리빙가이드 버튼

#### 3.4.5 진행 상태 단계

상태는 DB에 2자리 코드로 저장되며, 화면에는 한국어 라벨로 표시됩니다.

| 코드 | 라벨 | 이메일 발송 |
|------|------|-------------|
| `01` | 신청 | - |
| `02` | 접수완료 | 고객 알림 발송 |
| `03` | 담당자 배정 | 고객 알림 발송 |
| `04` | 일정 조율 중 | 고객 알림 발송 |
| `05` | A/S 완료 | 고객 알림 발송 |
| `06` | 처리완료 | 고객 알림 발송 |

**스테퍼 색상:**
- `01`: 회색
- `02` ~ `04`: 파란색
- `05` ~ `06`: 초록색

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
- **조회하기** 버튼: 입력 정보로 신청 목록 조회 → `/search/list?name=&phone=`

#### 3.5.2 신청 목록 페이지

**경로:** `/search/list`

**목록 구성:**
- "OOO 건축주님의 에필로그_" 제목
- 레이아웃: 테이블 형태 (제목, 날짜, 진행상황)
- 페이지네이션: 없음 (전체 목록 스크롤)
- 결과 없을 시 안내 메시지 표시

**인터랙션:**
- 목록 아이템 클릭 시 상세 페이지로 이동 (`/search/detail?name=&phone=&id={id}`)

#### 3.5.3 신청 상세 페이지

**경로:** `/search/detail`

**기능:**
- 진행상태 스테퍼 표시
- 신청 정보 전체 표시 (읽기 전용, 수정 불가)
  - 성함, 연락처, 이메일, 현장주소, 완공년도, 현장소장(있을 경우), 디자이너(있을 경우)
  - A/S 제목, A/S 내용 (줄바꿈 보존)
- 첨부파일 그리드 표시 (2열)
  - 이미지: 클릭 시 전체화면 모달 뷰어 (←/→ 키보드 및 버튼 탐색, Esc 닫기)
  - 비이미지: 파일 아이콘 표시
- 목록으로 돌아가기 버튼

---

### 3.6 리빙 가이드

**경로:** `/guide`

#### 3.6.1 콘텐츠 구성
- "living guide" 필기체 제목
- 검색 입력창
- "집짓기 관리의 모든것, 무엇이 궁금하세요?" 텍스트
- 건축주 셀프 A/S 대처 방법 (문, 건식벽체, 바닥재, 배관, 전기)
- A/S 가능 항목 및 보증 기간 안내
- 계절별 주거 관리 팁
- 긴급 상황 대처

#### 3.6.2 검색 기능
| 기능 | 설명 |
|------|------|
| 검색 입력창 | 상단 고정 (sticky) |
| 검색 방식 | 키워드 입력 시 해당 위치로 스크롤 이동 |
| 하이라이트 | 검색된 키워드 노란색 배경으로 강조 |
| 이전/다음 버튼 | 여러 매치 결과 간 이동 |
| 동작 | Ctrl+F 기능과 유사 |

#### 3.6.3 향후 확장 계획
- AI 기반 검색 기능
- AI 챗봇을 통한 질의응답

---

### 3.7 관리자 페이지

**경로:** `/admin` (비공개 - 직접 URL 접근만 가능, 미인증 시 `/admin/login`으로 리디렉션)

#### 3.7.1 로그인

**경로:** `/admin/login`

| 필드명 | 타입 | 필수 여부 |
|--------|------|-----------|
| 아이디 | Text | 필수 |
| 비밀번호 | Password | 필수 |

**인증 방식:** JWT 기반 인증 (24시간 유효, HttpOnly 쿠키)

#### 3.7.2 관리자 대시보드

**경로:** `/admin/dashboard`

**기능:**
- 전체 A/S 신청 목록 조회 (테이블 형태)
- 검색 및 필터 기능
- 로그아웃 버튼 (헤더)

**테이블 컬럼:** 성함, 연락처, 제목, 신청일, 진행상황

**검색 필터:**
| 필터 | 설명 |
|------|------|
| 이름 | 신청자 성함으로 검색 |
| 연락처 | 신청자 연락처로 검색 |
| 제목 | 신청 제목으로 검색 |
| 시작일/종료일 | 신청 날짜 범위로 검색 |
| 필터 초기화 | 모든 필터 조건 초기화 버튼 |

**상태 배지 색상:** 회색(01), 파란색(02~04), 초록색(05~06)

#### 3.7.3 관리자 상세 페이지

**경로:** `/admin/detail`

**기능:**
- 신청 정보 전체 조회 (제목, 신청일, 성함, 연락처, 이메일, 완공년도, 주소, 현장소장, 디자이너)
- 진행상태 스테퍼 표시
- **진행상황 수정** (드롭다운 선택 → 저장 버튼, 변경 없을 시 비활성화)
  - 상태 변경 시 고객에게 이메일 자동 발송
- A/S 제목 및 내용 조회
- 첨부파일 그리드 표시 (모바일 2열, 데스크톱 4열)
  - 이미지: 클릭 시 전체화면 모달 뷰어
  - 비이미지: 파일 아이콘 표시
- 목록으로 돌아가기 버튼

---

### 3.8 알림 기능

#### 3.8.1 관리자 알림
| 트리거 | 알림 대상 | 알림 방식 | 처리 방식 |
|--------|----------|----------|----------|
| 새로운 A/S 신청 | 관리자 이메일 | SMTP | 비동기 (API 응답 차단 없음) |

#### 3.8.2 사용자 알림
| 트리거 | 알림 대상 | 알림 방식 | 발송 조건 |
|--------|----------|----------|----------|
| 진행상황 변경 | 신청자 이메일 | SMTP | 02~06 상태 변경 시 모두 발송 |

**상태별 이메일 메시지:**
| 상태 | 메시지 |
|------|--------|
| 접수완료 (02) | "빠르게 해결해드리겠습니다" |
| 담당자 배정 (03) | "담당자가 배정되었습니다" |
| 일정 조율 중 (04) | "곧 연락드리겠습니다" |
| A/S 완료 (05) | "A/S가 완료되었습니다" |
| 처리완료 (06) | "감사합니다" |

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
| site_manager | VARCHAR(50) | 당시 현장소장 (선택) |
| designer | VARCHAR(50) | 당시 담당 디자이너 (선택) |
| title | VARCHAR(200) | 제목 |
| content | TEXT | A/S 신청 내용 |
| status | VARCHAR(20) | 진행상황 코드 (기본값: `'01'`) |
| created_at | DATETIME | 신청일시 |
| updated_at | DATETIME | 수정일시 |

**인덱스:**
- `idx_name_phone (name, phone)` - 고객 조회용
- `idx_status (status)` - 상태 필터용
- `idx_created_at (created_at)` - 정렬용

#### attachments (첨부파일)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| application_id | INT (FK) | 신청 ID |
| file_name | VARCHAR(255) | 원본 파일명 |
| file_path | VARCHAR(500) | 저장 경로 (`uploads/{applicationId}/{uuid}.ext`) |
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

**기본 계정:** username=`admin`, password=`admin123` (bcrypt 해시 저장, 배포 전 변경 필수)

---

## 5. API 설계

### 5.1 신청 API
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/applications` | 불필요 | 신청 등록 (FormData, 트랜잭션 처리) |
| GET | `/api/applications?name=&phone=` | 불필요 | 목록 조회 (성함+연락처 필수) |
| GET | `/api/applications/[id]?name=&phone=` | 불필요 | 상세 조회 (성함+연락처 일치 검증) |

### 5.2 파일 API
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/api/files/[id]` | 불필요 | 파일 서빙 (이미지: inline 렌더링 + 1년 캐시, 기타: 다운로드) |

### 5.3 관리자 API
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/admin/login` | 불필요 | 로그인 (JWT 쿠키 설정) |
| POST | `/api/admin/logout` | 필요 | 로그아웃 (쿠키 삭제) |
| GET | `/api/admin/applications` | 필요 | 전체 목록 조회 |
| GET | `/api/admin/applications/[id]` | 필요 | 상세 조회 (첨부파일 포함) |
| PATCH | `/api/admin/applications/[id]` | 필요 | 진행상황 수정 + 고객 이메일 발송 |

**인증 방식:** Next.js Middleware가 `/admin/*`, `/api/admin/*` 경로를 보호. `admin_token` 쿠키(HttpOnly)에서 JWT 검증.

---

## 6. 비기능 요구사항

### 6.1 보안
- ✅ 관리자 비밀번호 해싱 (bcryptjs)
- ✅ JWT 기반 인증 (24시간 만료)
- ✅ Next.js Middleware 라우트 보호
- ✅ SQL Injection 방지 (Prepared Statements)
- ✅ XSS 방지
- ✅ 파일 업로드 검증 (MIME 타입 + 확장자 이중 검증, 파일당 5MB 제한)

### 6.2 성능
- ✅ Next.js standalone 빌드 (경량 Docker 이미지 ~100MB)
- ✅ DB 인덱싱 (조회, 상태 필터, 정렬)
- ✅ DB 커넥션 풀링 (connectionLimit: 10)
- ✅ 클라이언트 사이드 이미지 압축 (업로드 트래픽 절감)
- ✅ 이미지 브라우저 캐싱 (1년 immutable)

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
- `app`: Next.js 앱 컨테이너 (멀티스테이지 빌드: deps → builder → runner)
- `db`: MariaDB 10.11 컨테이너
- 네트워크: `ggglog-network` (커스텀 브리지)
- 볼륨: `mariadb_data` (DB 영속성), `uploads` (파일 영속성)
- 실행 사용자: `nextjs` (UID 1001, 보안)

### 7.3 환경 변수 (.env)
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET (최소 32자)
ADMIN_EMAIL
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
NEXT_PUBLIC_BASE_URL (이메일 링크용)
```

### 7.4 nginx + SSL
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
│   │   │   │   ├── route.ts           # 신청 등록(POST), 목록 조회(GET)
│   │   │   │   └── [id]/route.ts      # 상세 조회(GET)
│   │   │   ├── files/
│   │   │   │   └── [id]/route.ts      # 파일 서빙
│   │   │   └── admin/
│   │   │       ├── login/route.ts     # 관리자 로그인
│   │   │       ├── logout/route.ts    # 관리자 로그아웃
│   │   │       └── applications/
│   │   │           ├── route.ts       # 전체 목록 조회
│   │   │           └── [id]/route.ts  # 상세 조회, 상태 수정
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── detail/page.tsx
│   │   ├── apply/
│   │   │   ├── page.tsx
│   │   │   └── complete/page.tsx
│   │   ├── search/
│   │   │   ├── page.tsx
│   │   │   ├── list/page.tsx
│   │   │   └── detail/page.tsx
│   │   ├── guide/page.tsx
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
│   │   ├── ImageModal.tsx             # 전체화면 이미지 뷰어
│   │   └── Loading.tsx
│   ├── lib/
│   │   ├── db.ts                      # DB 커넥션 풀 + 타입 정의
│   │   ├── auth.ts                    # JWT 생성/검증/쿠키
│   │   ├── email.ts                   # 이메일 발송 함수
│   │   └── status.ts                  # 상태 코드-라벨 매핑
│   └── middleware.ts                  # 관리자 라우트 인증 가드
├── docs/
│   ├── PRD.md
│   └── DEPLOYMENT.md
├── scripts/
│   └── create-admin.js
├── public/
│   └── images/
│       └── ggglog-logo.png
├── uploads/                           # 첨부파일 저장소 (Docker 볼륨)
├── Dockerfile
├── docker-compose.yml
├── nginx.conf.example
├── init.sql
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 9. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 0.1 | 2026-01-15 | 초안 작성 |
| 1.0 | 2026-01-20 | 구현 완료, 기술 스택 확정, 인프라 구성 추가 |
| 1.1 | 2026-02-28 | 실제 구현 코드 기준으로 전면 업데이트 (파일 용량 정정, 상태 코드 시스템, ImageModal 컴포넌트, status.ts, 이메일 발송 조건, 푸터 표시 조건, 필드 글자수 제한, 파일 서빙 방식 등) |

---

## 10. 완료 사항

- [x] 프론트엔드 프레임워크: Next.js 14 (App Router)
- [x] 파일 업로드 저장소: 로컬 (Docker 볼륨)
- [x] 관리자 계정 생성: 스크립트 제공 (`scripts/create-admin.js`)
- [x] 화면 정의서 반영
- [x] 배포 가이드 작성 (`docs/DEPLOYMENT.md`)
- [x] 클라이언트 사이드 이미지 압축
- [x] 전체화면 이미지 모달 뷰어 (ImageModal)
- [x] 상태 코드-라벨 매핑 모듈 (status.ts)
- [x] Next.js Middleware 기반 인증 가드
- [x] 관리자 상태 변경 시 고객 이메일 자동 발송 (전 상태 코드)
