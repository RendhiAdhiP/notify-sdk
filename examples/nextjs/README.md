# Next.js Integration Example

Example implementasi RWS SDK (`rws-js`) di Next.js App Router.

## Setup

1. Install dependency:

```bash
npm install github:RendhiAdhiP/rws-js
```

Atau jika local:

```bash
npm install ../../rws-js
```

2. Copy file berikut ke project Next.js kamu:
   - `lib/rws.ts` — Inisialisasi client singleton (`RWSClient`)
   - `providers/RWSProvider.tsx` — Context provider dengan hook `useRWS()`
   - `components/RWSBell.tsx` — Contoh komponen notifikasi

## Struktur File

```
app/
├── lib/
│   └── rws.ts
├── providers/
│   └── RWSProvider.tsx
├── components/
│   └── RWSBell.tsx
└── layout.tsx
```
