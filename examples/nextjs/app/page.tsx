"use client"

import { RWSBell } from "../components/RWSBell"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My App</h1>
        <RWSBell userId="user123" />
      </header>

      <section>
        <h2 className="text-xl mb-4">Dashboard</h2>
        <p className="text-gray-600">
          Kamu akan menerima notifikasi real-time untuk channel orders, system,
          dan messages.
        </p>
      </section>
    </main>
  )
}
