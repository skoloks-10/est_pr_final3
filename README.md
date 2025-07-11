# 🌱 중고스왑

## 📚 목차

- 주요 기능
- 기술 스택
- 프로젝트 구조
- 설치 및 실행 방법
- 팀원 및 역할 분담

## 🚀 주요 기능

- **인증** : 스플래시 화면, 회원가입, 로그인/로그아웃 기능
- **피드** : 팔로우한 사용자의 게시물을 모아보는 메인 피드 (무한 스크롤 적용)
- **게시물** : 게시물 작성, 수정, 삭제, 상세 보기 기능 (다중 이미지 업로드 지원)
- **프로필** : 사용자 프로필 정보 조회, 프로필 수정, 내가 작성한 게시물 및 판매 상품 목록 보기
- **소셜** : 다른 사용자 팔로우/언팔로우, 팔로워/팔로잉 목록 보기, 좋아요, 댓글 기능
- **상품** : 판매 상품 등록, 수정, 삭제 기능
- **검색** : 사용자 검색 기능 (디바운싱 적용)
- **채팅** : 기본적인 채팅 UI (실제 채팅 기능은 미구현)

## 💻 기술 스택

- **프론트엔드** : React, React Router, Context API
- **스타일링** : CSS, CSS Module
- **상태 관리** : Context API, useState, useEffect
- **HTTP 클라이언트** : Fetch API
- **이미지 처리** : Blob URL, FormData
- **개발 도구** : Vite, ESLint, Prettier

## 📁 프로젝트 구조

```src
src
├── assets
│   └── images       # 아이콘, 로고 등 정적 이미지
├── components
│   ├── common       # 헤더, 푸터, 모달 등 공통 컴포넌트
│   └── profile      # 프로필 관련 컴포넌트 (PostList, ProductList 등)
├── context
│   └── UserContext  # 사용자 정보 전역 관리를 위한 Context
├── pages            # 페이지 컴포넌트
│   ├── LoginPage
│   ├── HomePage
│   ├── ProfileSetupPage
│   ├── PostUploadPage
│   └── ...
├── styles           # CSS 파일
├── utils            # 유틸리티 함수
├── App.jsx          # 라우팅 설정
└── main.jsx         # 애플리케이션 진입점
```

## 📝 구현 과정 및 문제 해결

### 1. GitHub Pages 배포 후 404 오류

- **문제** : React Router의 `BrowserRouter`를 사용한 SPA를 배포 시, 메인 페이지 외 다른 경로로 직접 접근하거나 새로고침하면 404 오류가 발생했습니다.
- **해결** : React Router를 [HashRouter](vscode-file://vscode-app/c:/Users/Hoon/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)로 변경하여 URL에 해시(#)를 포함시켜 클라이언트 사이드 라우팅임을 명시적으로 처리했습니다.

### 2. Git 버전 관리의 어려움

- **문제** : 팀 프로젝트 초기, 브랜치 전략 부재로 잦은 머지 충돌(Merge Conflict)이 발생했으며, `git pull` 명령어 실수로 로컬 소스 파일이 유실되는 문제가 있었습니다.
- **해결** : 저장소를 초기화하고 브랜치 관리 전략을 재정립했으며, Git의 버전 히스토리를 통해 유실된 파일을 복구했습니다.

### 3. 이미지 처리 및 CORS 오류

- **문제** : 서버에서 불러온 이미지가 CORS 정책 위반으로 렌더링되지 않거나, 이미지 업로드 API의 응답 형식이 예상과 달라 파일명을 제대로 파싱하지 못했습니다.
- **해결** :
- 이미지 태그에 [crossOrigin=&#34;anonymous&#34;](vscode-file://vscode-app/c:/Users/Hoon/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 속성을 추가했습니다.

## 📝 API 정보

본 프로젝트는 아래 API를 기반으로 제작되었습니다.

- **Base URL** : `https://dev.wenivops.co.kr/services/mandarin`
- **주요 Endpoints** :
- **인증** :
  - `POST /user/login`: 로그인
  - `POST /user`: 회원가입
- **게시물** :
  - `GET /post/feed`: 팔로잉 게시글 피드
  - `POST /post`: 게시물 작성
  - `PUT /post/:postId`: 게시물 수정
- **프로필** :
  - `GET /profile/:accountname`: 프로필 정보 조회
  - `GET /profile/:accountname/follower`: 팔로워 목록 조회
- **상품** :
  - `POST /product`: 상품 등록
  - `DELETE /product/:productId`: 상품 삭제

## 🌟 추가 개발 계획

1. **실시간 채팅 기능 구현**
   - Socket.IO를 활용한 실시간 메시지 전송 기능
2. **검색 기능 강화**
   - 상품 및 게시물 검색 기능 추가
   - 필터링 및 정렬 옵션 제공
3. **반응형 디자인 개선**
   - 다양한 디바이스에서의 사용자 경험 최적화
4. **성능 최적화**
   - 이미지 지연 로딩 구현
   - 컴포넌트 메모이제이션을 통한 렌더링 성능 향상

## 👥 팀원 및 역할

| 이름 | 역할 | 담당 역할 |

| -------- | -------- | --------- |

| [정승훈] | Frontend | 기능구현 |

| [김현미] | Frontend | 마크업 |
