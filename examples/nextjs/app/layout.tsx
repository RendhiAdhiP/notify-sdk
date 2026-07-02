import type { ReactNode } from "react"
import { NotificationProvider } from "../providers/NotificationProvider"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider
          channels={["orders", "system", "messages"]}
          origin={process.env.NEXT_PUBLIC_NOTIF_ORIGIN!}
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
