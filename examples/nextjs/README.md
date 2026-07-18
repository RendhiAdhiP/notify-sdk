# Next.js Integration Example

Example implementasi RWS SDK (`rws-sdk`) di Next.js App Router.

## Setup

1. Install dependency:

```bash
npm install github:RendhiAdhiP/notify-sdk
```

Atau jika local:

```bash
npm install ../../notification-sdk
```

2. Copy file berikut ke project Next.js kamu:
   - `lib/notification.ts` — Inisialisasi client singleton (`RWSClient`)
   - `providers/NotificationProvider.tsx` — Context provider dengan hook `useNotification()`
   - `components/NotificationBell.tsx` — Contoh komponen notifikasi

## Struktur File

```
app/
├── lib/
│   └── notification.ts
├── providers/
│   └── NotificationProvider.tsx
├── components/
│   └── NotificationBell.tsx
└── layout.tsx
```
