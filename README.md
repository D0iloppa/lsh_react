# 📱 lsh_react

모바일 환경을 위한 React 기반 웹 애플리케이션입니다.  
Docker 기반의 개발 환경 위에서 실행되며, 내부 호스트명은 `lsh.host`로 설정되어 있습니다.

---

## 🧱 프로젝트 개요

- **프레임워크**: [React](https://react.dev/)
- **번들러**: [Vite](https://vitejs.dev/)
- **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
- **상태관리**: React Context API
- **라우팅**: [React Router DOM](https://reactrouter.com/)
- **UI 컴포넌트**: [Lucide React](https://lucide.dev/) + [Overlay Kit](https://overlay-kit.com/)
- **환경 구성**: Docker + Dev Container
- **접속 도메인**: http://lsh.host/lsh (개발용 내부 도메인)
---

## 📦 개발 환경

### 사전 요구 사항

- Docker
- VSCode + Remote - Containers 확장
- (선택) WSL2 환경
- nginx (리버스 프록시 용도)


### 폴더 구조
```
lsh_staff/
├── public/
├── src/
│ ├── components/ # 재사용 가능한 컴포넌트 (통페이지 컴포넌트 포함)
│ ├── pages/ # 페이지 컴포넌트
│ ├── layout/ # 레이아웃 컴포넌트 (StaffApp.jsx)
│ ├── contexts/ # React Context (인증, 메시지 등)
│ ├── hooks/ # 커스텀 훅
│ ├── config/ # 설정 파일 (pages.config.js)
│ ├── utils/ # 유틸리티 함수
│ └── assets/ # 정적 리소스
├── .devcontainer/
├── vite.config.js
├── tailwind.config.cjs
├── package.json
├── README.md
└── ...
```

---

## 🚀 프로젝트 시작 방법

### 1. 프로젝트 클론
```
git clone https://github.com/D0iloppa/lsh_react.git
cd lsh_react
```

### 2. Docker에서 개발모드 live로 열기
```
# node 런타임
docker exec -it lsh_react /bin/bash

# 컨테이너 진입후, 기동
./dev_start.sh

```

### 3. 개발 서버 실행
```
npm install
npm run dev -- --host
```
--host 플래그는 외부 접근을 허용합니다. vite.config.js에서도 host: '0.0.0.0'으로 설정되어 있어야 합니다.

### 🌐 접속 방법
브라우저에서 http://{lsh.host} 접속

nginx를 통해 React dev 서버(5173)로 리버스 프록시됩니다

도메인 lsh.host는 개발용입니다. 실제 접속을 위해서는 hosts 파일에 IP 매핑이 필요할 수 있습니다.

# 🐳 Docker 관련 참고
React 개발 서버는 컨테이너에서 구동되며, Vite는 내부 포트 5173에서 리스닝

nginx는 별도 컨테이너로 실행되며, proxy_pass http://<react-container>:5173 방식으로 구성

두 컨테이너는 공통 사용자 정의 Docker 네트워크(dev-net 등)에 연결되어야 합니다

### 📌 기타
기본 .gitignore는 node_modules, dist, logs, .vscode/, .idea/ 등을 포함합니다

주요 커밋 메시지 스타일은 자유롭게, 초기 커밋은 "init" 사용

최초 커밋 후 main 브랜치로 GitHub에 push 필요



# 📫 Maintainer
Author: D0iloppa

Email: kdi3939@gmail.com


# 🔧 Internal Notes

### 빌드 및 배포 명령어

```bash
# 1. React 앱 빌드
docker exec -it lsh_react npm run build

# 2. 기존 파일 삭제 및 새 디렉토리 생성
docker exec -it nginx rm -rf /usr/app/lsh_staff
docker exec -it nginx mkdir -p /usr/app/lsh_staff

# 3. 새로운 파일 복사
docker cp /home/doil/workspace/w_dev/docker/lsh_staff/dist/. nginx:/usr/app/lsh_staff/

# 4. 복사 확인
docker exec -it nginx ls -la /usr/app/lsh_staff/

# 5. nginx 설정 재로드
docker exec -it nginx nginx -s reload
```

### 개발 환경 확인
```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs lsh_react
docker logs nginx

# 컨테이너 내부 접속
docker exec -it lsh_react bash
docker exec -it nginx bash
```