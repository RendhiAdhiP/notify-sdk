# RWS SDK

**RWS SDK** — Realtime WebSocket client untuk notifikasi, chat, dan event realtime multi-tenant.
Membungkus komunikasi Socket.io dengan API yang sederhana, type-safe, dan framework-agnostic.

Package: `rws-sdk` | Exports class: `RWSClient`

## Fitur

-   Koneksi WebSocket dengan autentikasi otomatis (`project_token` + `origin`)
-   Subscribe / Unsubscribe ke channel notifikasi
-   Menerima notifikasi real-time via event listener
-   Fetch semua notifikasi (publik & private) dengan state read/delete
-   Mark as read, mark all as read, mark as delete
-   Auto-reconnect dengan exponential backoff
-   Manajemen token & origin
-   TypeScript first — full type definitions
-   Framework-agnostic — bisa digunakan di Next.js, React, Vue, atau vanilla JS

## Instalasi

```bash
npm install github:RendhiAdhiP/notify-sdk
```

Atau dari local package (development):

```bash
npm install ../notification-sdk
```

## Quick Start

```typescript
import { RWSClient } from "rws-sdk"

const client = new RWSClient({
  serverUrl: "https://notif.regarmarket.id",
  projectToken: "your-project-token",
  origin: "regarmarket",
})

// Listen notifikasi real-time
client.on("notification", (notif) => {
  console.log("Notifikasi baru:", notif.title)
})

// Join channel
client.join("regarmarket", "orders", "user123")

// Fetch semua notifikasi
const notifs = await client.getNotifications(["orders", "system"], "user123")
```

## Dokumentasi Lengkap

- [INSTALL.md](docs/INSTALL.md) — Cara instalasi dan build
- [USAGE.md](docs/USAGE.md) — Panduan penggunaan lengkap dengan contoh
- [API.md](docs/API.md) — Dokumentasi API Reference
- [CHANGELOG.md](docs/CHANGELOG.md) — Riwayat perubahan

## Struktur Project

```
notification-sdk/
├── src/
│   ├── index.ts          # Entry point (exports RWSClient + types)
│   ├── types/            # Type definitions (config, notification, events)
│   ├── core/             # Core client, auth, reconnection
│   ├── handlers/         # Event listener management
│   ├── utils/            # Utilities & helpers
│   └── config/           # Default configuration
├── docs/                 # Documentation
├── examples/             # Example implementations
│   └── nextjs/           # Next.js example
├── dist/                 # Build output
├── package.json          # Package name: rws-sdk
└── tsconfig.json
```
