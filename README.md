# WearAgain Admin Frontend

WearAgain 관리자 대시보드 프론트엔드 애플리케이션입니다.

## 📋 프로젝트 개요

이 프로젝트는 WearAgain 플랫폼의 관리자용 대시보드로, 행사 관리, 게시글 관리, 상점 관리, 참가자 관리 등의 기능을 제공하는 React 기반 웹 애플리케이션입니다.

## 🚀 기술 스택

- **React** 18
- **TypeScript** 4.9
- **Tailwind CSS** 3.4

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/
│   │   ├── DataList/
│   │   ├── DataListFooter/
│   │   ├── PageHeader/
│   │   ├── Pagination/
│   │   ├── ProtectedRoute/
│   │   └── PublicRoute/
│   ├── layout/
│   │   └── Navigation/
│   └── pages/
│       ├── dashboard/
│       ├── events/
│       ├── posts/
│       ├── store/
│       ├── participants/
│       ├── admin/
│       └── auth/
├── utils/
│   ├── api.ts
│   └── auth.ts
├── styles/
│   ├── App.css
│   └── index.css
└── App.tsx

public/
├── img/
│   ├── icon/
│   ├── default/
│   ├── example/
│   └── uploads/
└── index.html
```

## 🖥️ 주요 페이지

### 1. 관리자 대시보드 (`/`)

- 전체 행사 현황 통계
- 누적 환경 임팩트 (CO2, 에너지, 물 절약량)
- 파티 랭킹 TOP 3

### 2. 행사 관리 (`/events`)

- 행사 목록 조회 및 검색/필터링
- 행사 상세 정보 확인
- 행사 등록 및 수정
- 행사 승인 관리

### 3. 게시글 관리 (`/posts`)

- 게시글 목록 조회 및 검색/필터링
- 게시글 상세 정보 및 댓글 관리

### 4. 상점 관리 (`/store`)

- 상품 목록 조회 및 검색/필터링
- 상품 등록 및 수정

### 5. 참가자 관리 (`/repair`)

- 참가자 목록 조회 및 검색
- 참가자 상세 정보 확인 및 수정
- 참가자 통계

### 6. 관리자 계정 승인 (`/approval`)

- 관리자 가입 신청 승인

## 🔐 인증 시스템

- JWT 토큰 기반 인증
- 자동 토큰 재발급
- 라우터 기반 접근 제어
- 로그인/회원가입 기능

## 🚀 시작하기

### 사전 요구사항

- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/SSASINSA/WearAgain-Admin-FrontEnd.git

# 프로젝트 디렉토리로 이동
cd WearAgain-Admin-FrontEnd

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 브라우저에서 http://localhost:3000/admin 접속
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드된 파일은 build/ 폴더에 생성됩니다
```

### 테스트

```bash
# 테스트 실행
npm test
```

## 📝 주요 기능

- ✅ 관리자 대시보드 (통계 및 현황)
- ✅ 행사 관리 (CRUD, 검색, 필터링)
- ✅ 게시글 관리 (CRUD, 검색, 필터링)
- ✅ 상점 관리 (상품 CRUD, 검색, 필터링)
- ✅ 참가자 관리 (참가자 목록, 통계)
- ✅ JWT 토큰 기반 인증 시스템
- ✅ 자동 토큰 재발급
- ✅ 라우터 기반 접근 제어
- ✅ 반응형 디자인
