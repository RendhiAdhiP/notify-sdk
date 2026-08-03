import type { ReactNode } from "react"
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
