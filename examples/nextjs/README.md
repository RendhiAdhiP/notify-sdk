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
   - `app/layout.tsx` — Layout dengan `RWSProvider` sebagai root provider

3. Siapkan environment variable di `.env.local`:

```
NEXT_PUBLIC_RWS_SERVER_URL=https://notif.regarmarket.id
NEXT_PUBLIC_RWS_PROJECT_TOKEN=your-project-token
NEXT_PUBLIC_RWS_ORIGIN=your-origin
```

## Struktur File

```
examples/nextjs/
├── app/
│   ├── layout.tsx        # Root layout dengan RWSProvider
│   └── page.tsx          # Contoh halaman notifikasi
├── lib/
│   └── rws.ts            # Singleton RWSClient
└── providers/
    └── RWSProvider.tsx   # Context provider + hook useRWS()
```

## Penggunaan

Bungkus `RWSProvider` di root layout dengan daftar channel dan origin:

```tsx
import { RWSProvider } from "../providers/RWSProvider"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RWSProvider
          channels={["all", "promo", "messages"]}
          origin={process.env.NEXT_PUBLIC_RWS_ORIGIN!}
        >
          {children}
        </RWSProvider>
      </body>
    </html>
  )
}
```

Lalu gunakan hook `useRWS()` di komponen client untuk connect dan membaca notifikasi:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRWS } from '@/providers/RWSProvider';

export default function Notifikasi() {
    const { connectionState, notifications, connect, refresh, markAsRead, markAllAsRead, markAsDelete } = useRWS();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        setUserId('user-123');
        if (connectionState !== 'connected') {
            connect('user-123').catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (userId && connectionState === 'connected') {
            refresh().catch(() => {});
        }
    }, [userId, connectionState]);

    return (
        <div>
            <p>Status: {connectionState}</p>
            <p>Unread: {notifications?.total_unread ?? 0}</p>
        </div>
    );
}
```
