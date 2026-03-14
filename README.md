# squid5-backend

NestJS 기반 백엔드 서버입니다.

## 기술 스택

- **Framework**: NestJS (TypeScript)
- **WebSocket**: Socket.IO
- **인증**: JWT

## 아키텍처

헥사고날 아키텍처(Ports & Adapters)를 적용합니다. 각 도메인은 아래 계층으로 구성됩니다.

```
src/modules/{domain}/
├── domain/
│   ├── entities/        # 도메인 엔티티
│   ├── errors/          # 도메인 에러
│   └── ports/
│       ├── inbound/     # Use Case 인터페이스
│       └── outbound/    # Repository / Broadcaster 인터페이스
├── usecase/             # Use Case 구현체
├── infrastructure/      # Repository 구현체 (DB, In-Memory 등)
└── presentation/        # Controller / Gateway (진입점)
```

의존성 방향은 항상 외부(presentation, infrastructure) → 내부(domain)이며, 도메인은 외부 구현체를 직접 참조하지 않습니다.

## 도메인

| 도메인 | 주요 역할 | 통신 방식 |
|--------|-----------|-----------|
| User   | 회원가입, 로그인, 내 정보 조회/수정, 로그아웃 | HTTP REST |
| Chat   | 메시지 송수신, 브로드캐스트 | WebSocket (Socket.IO) |

## 실행 및 디버그

`.vscode/launch.json`에 아래 구성이 포함되어 있으므로 VSCode의 실행 패널(F5)에서 바로 사용할 수 있습니다.

| 구성 이름 | 설명 |
|-----------|------|
| Run NestJS (Dev) | watch 모드로 서버 실행 |
| Debug NestJS | 디버거 연결 + watch 모드 |
| Run Jest (Unit) | 유닛 테스트 실행 |
| Run Jest (E2E) | e2e 테스트 실행 |

터미널에서 직접 실행할 경우:

```bash
npm install

# 개발 (watch)
npm run start:dev

# 유닛 테스트
npm run test

# e2e 테스트
npm run test:e2e
```
