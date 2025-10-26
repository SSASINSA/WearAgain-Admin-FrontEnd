# WearAgain Admin Frontend - AI Assistant Guide

## 🎯 프로젝트 개요

WearAgain 관리자 대시보드 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- React 18
- TypeScript
- React Router DOM
- CSS (커스텀 스타일링)

## 📁 주요 컴포넌트

- `AdminDashboard.tsx` - 관리자 대시보드 (통계 및 현황)
- `EventsManagement.tsx` - 행사 관리 (CRUD, 검색, 필터링)
- `PostsManagement.tsx` - 게시글 관리 (CRUD, 검색, 필터링)
- `StoreManagement.tsx` - 상점 관리 (상품 CRUD, 검색, 필터링)
- `ParticipantManagement.tsx` - 참가자 관리 (참가자 목록, 통계)
- `Navigation.tsx` - 네비게이션 바

## 🎨 디자인 시스템

- **Figma 디자인**: 모든 UI는 Figma 디자인 시안을 기반으로 구현
- **아이콘**: SVG 아이콘 사용 (public/assets/ 폴더)
- **반응형 디자인**: 다양한 화면 크기에 대응
- **일관된 스타일링**: 통일된 색상, 폰트, 간격 사용

## 📋 주요 기능

1. **관리자 대시보드**: 전체 행사 현황, 환경 임팩트, 파티 랭킹
2. **행사 관리**: 행사 목록, 검색/필터링, CRUD 기능
3. **게시글 관리**: 게시글 목록, 검색/필터링, 정렬 기능
4. **상점 관리**: 상품 목록, 검색/필터링, CRUD 기능
5. **참가자 관리**: 참가자 통계, 목록, 검색 기능

## 🔧 개발 가이드

- 컴포넌트별 CSS 파일은 `src/styles/components/` 폴더에 위치
- SVG 아이콘은 `public/assets/` 폴더에서 관리
- TypeScript를 사용하므로 타입 안정성 유지
- React Router를 사용한 SPA 구조

## 📝 코딩 스타일

### TypeScript/React 규칙

- **컴포넌트명**: PascalCase 사용 (예: `AdminDashboard`, `EventsManagement`)
- **파일명**: PascalCase.tsx (예: `AdminDashboard.tsx`)
- **함수명**: camelCase 사용 (예: `handleSubmit`, `fetchData`)
- **상수명**: UPPER_SNAKE_CASE 사용 (예: `API_BASE_URL`, `MAX_ITEMS`)

### 컴포넌트 구조

```typescript
// 1. Import 문
import React from "react";
import { ComponentProps } from "./types";

// 2. Interface 정의
interface ComponentNameProps {
  title: string;
  onAction: () => void;
}

// 3. 컴포넌트 정의
const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction }) => {
  // 4. State 및 Hooks
  const [state, setState] = useState<string>("");

  // 5. Event Handlers
  const handleClick = () => {
    onAction();
  };

  // 6. Render
  return (
    <div className="component-name">
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

export default ComponentName;
```

### CSS 스타일링

- **클래스명**: kebab-case 사용 (예: `admin-dashboard`, `event-card`)
- **CSS 파일**: 컴포넌트명과 동일하게 명명 (예: `AdminDashboard.css`)
- **반응형**: 모바일 퍼스트 접근법 사용
- **색상**: CSS 변수 활용 (예: `var(--primary-color)`)

### 네이밍 컨벤션

- **Props**: camelCase (예: `isVisible`, `onClickHandler`)
- **State**: camelCase (예: `isLoading`, `selectedItem`)
- **Event Handlers**: `handle` + 동사 (예: `handleSubmit`, `handleDelete`)
- **API 함수**: `fetch` + 명사 (예: `fetchEvents`, `fetchUsers`)

### 파일 구조

```
src/
├── components/
│   ├── ComponentName.tsx
│   └── ComponentName.css
├── styles/
│   ├── components/
│   │   └── ComponentName.css
│   ├── App.css
│   └── index.css
└── types/
    └── index.ts
```

## 📝 이슈 템플릿

프로젝트에는 다음 이슈 템플릿이 설정되어 있습니다:

- ✨ Feature Request - 새로운 기능 제안
- 🐛 Bug Fix - 버그 발견 및 수정
- 🔧 Infra Change - 인프라 변경 요청 및 작업 내역
- 🔨 Refactor Request - 코드 리팩토링

## 🤖 AI Assistant 사용법

- 이슈 생성이 필요할 때: "이슈 만들어줘"라고 요청
- GitHub MCP를 통해 기존 이슈 템플릿 활용
- CLI 없이 Cursor에서 직접 처리

## 🌿 Git 브랜치 및 커밋 명명 규칙

### 브랜치 명명 규칙

**형식**: `이슈 템플릿 명/ 작업 내용 (#이슈번호)`

**예시**:

- `Feature/ 메인 화면 구현 (#1)`
- `BugFix/ 로그인 오류 수정 (#5)`
- `Refactor/ 컴포넌트 구조 개선 (#12)`
- `Infra/ 배포 파이프라인 설정 (#8)`

### 커밋 명명 규칙

**형식**: `#이슈번호/ 작업 내용`

**예시**:

- `#10/ 버튼 추가`
- `#15/ API 연동 구현`
- `#3/ 반응형 디자인 적용`
- `#7/ 에러 처리 로직 개선`

### 브랜치 및 커밋 명명 가이드라인

- **브랜치명**: 이슈 템플릿 타입을 영어로 시작 (Feature, BugFix, Refactor, Infra)
- **커밋명**: 간결하고 명확한 작업 내용 설명
- **이슈 번호**: 항상 괄호 안에 표시하여 추적 가능하도록 설정
- **한글 사용**: 작업 내용은 한글로 작성하여 이해하기 쉽게 구성

## 🎨 Figma MCP 사용 시 주의사항

### 디자인 구현 규칙

- **시각적 디자인 우선**: Figma의 색상, 폰트, 아이콘, 레이아웃을 정확히 구현
- **아이콘 출처**: 무조건 Figma 페이지에서 제공된 아이콘만 사용
- **색상/폰트**: Figma 디자인 시스템의 색상 팔레트와 타이포그래피 준수
- **레이아웃**: Figma의 spacing, padding, margin 값 정확히 적용

### Figma MCP 사용법

1. **디자인 확인**: `@Figma Desktop` 명령으로 현재 선택된 노드의 디자인 정보 조회
2. **아이콘 추출**: Figma에서 제공된 SVG 아이콘을 `public/assets/` 폴더에 저장
3. **컴포넌트 구현**: **React 구조에 맞게** 컴포넌트 작성 (Figma 구조 무시)
4. **스타일 적용**: Figma의 CSS 속성을 정확히 재현

### 구조 관련 주의사항

- **Figma 구조 ≠ React 구조**: Figma의 레이어 구조를 React 컴포넌트 구조로 무조건 변환하지 않음
- **논리적 컴포넌트 분리**: React의 재사용성과 유지보수성을 고려한 컴포넌트 설계
- **연결되지 않은 Figma**: 구조가 제대로 연결되지 않은 Figma는 시각적 디자인만 참고
- **React 모범 사례**: React의 컴포넌트 설계 원칙을 우선시

### 금지사항

- ❌ 외부 아이콘 라이브러리 사용 (예: React Icons, Heroicons)
- ❌ 임의의 색상이나 폰트 사용
- ❌ Figma의 레이어 구조를 무조건 React 컴포넌트로 변환
- ❌ 연결되지 않은 Figma 구조를 강제로 React 구조로 매핑

### 권장사항

- ✅ Figma의 **시각적 디자인**을 픽셀 퍼펙트하게 구현
- ✅ Figma에서 제공된 모든 디자인 토큰 활용
- ✅ React의 컴포넌트 설계 원칙에 맞는 구조 선택
- ✅ 재사용 가능하고 유지보수하기 쉬운 컴포넌트 구조
- ✅ Figma의 시각적 요소를 React의 논리적 구조로 적절히 매핑

### 필수사항
- 피그마 화면의 링크가 주어질시, 해당 화면을 스크린샷으로 표시하고 그를 바탕으로 작업업
