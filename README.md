# 📱 lsh_react

모바일 환경을 위한 React 기반 웹 애플리케이션입니다.  
Docker 기반의 개발 환경 위에서 실행되며, 내부 호스트명은 `lsh.host`로 설정되어 있습니다.

---

## 🧱 프로젝트 개요

- **프레임워크**: [React](https://react.dev/)
- **번들러**: [Vite](https://vitejs.dev/)
- **환경 구성**: Docker + Dev Container
- **접속 도메인**: http://lsh.host (개발용 내부 도메인)

---

## 📦 개발 환경

### 사전 요구 사항

- Docker
- VSCode + Remote - Containers 확장
- (선택) WSL2 환경
- nginx (리버스 프록시 용도)


### 폴더 구조
```
lsh_react/
├── public/
├── src/
├── .devcontainer/
├── Dockerfile (생략 가능)
├── vite.config.js
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

### 2. VSCode에서 Dev Container로 열기

VSCode에서 .devcontainer/ 포함된 폴더를 열고
Reopen in Container 선택

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