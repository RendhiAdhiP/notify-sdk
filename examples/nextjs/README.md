# Next.js Integration Example

Example implementasi Notification SDK di Next.js App Router.

## Setup

1. Install dependency:

```bash
npm install notification-sdk
```

Atau jika local:

```bash
npm install ../../notification-sdk
```

2. Copy file berikut ke project Next.js kamu:
   - `lib/notification.ts` — Inisialisasi client (server-side)
   - `hooks/useNotification.ts` — React hook untuk component
   - `providers/NotificationProvider.tsx` — Context provider
   - `components/NotificationBell.tsx` — Contoh komponen

## Struktur File

```
app/
├── lib/
│   └── notification.ts
├── hooks/
│   └── useNotification.ts
├── providers/
│   └── NotificationProvider.tsx
└── components/
    └── NotificationBell.tsx
```
