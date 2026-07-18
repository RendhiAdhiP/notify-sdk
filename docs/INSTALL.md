# Instalasi

## Prasyarat

- Node.js >= 18
- npm atau yarn

## Install dari Private Repository

```bash
npm install github:RendhiAdhiP/notify-sdk
```

Package akan terinstall sebagai `rws-sdk`. Import class `RWSClient`:

```typescript
import { RWSClient } from "rws-sdk"
```

## Install dari Local Package (Development)

Jika SDK berada di sibling directory:

```bash
npm install ../notification-sdk
```

Atau di `package.json`:

```json
{
  "dependencies": {
    "rws-sdk": "file:../notification-sdk"
  }
}
```

## Build Project

```bash
# Clone atau copy project
git clone <repo-url>
cd notification-sdk

# Install dependencies
npm install

# Build
npm run build

# Type checking (tanpa build)
npm run typecheck
```

### Output Build

- `dist/index.js` — ES Module
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — TypeScript declarations

## Package Private

Package ini sudah ditandai `"private": true` dan tidak akan terpublish ke npm registry.

Untuk internal distribution, push ke private git repository dan install via git URL seperti di atas.

## Dependency

- `socket.io-client` ^4.8.0 — satu-satunya dependency eksternal
- Tidak memerlukan React atau framework lain — fully framework-agnostic
