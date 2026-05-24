import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Allo Inventory',
  description: 'Inventory reservation system'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <nav className="border-b px-8 py-4 flex items-center gap-2">
          <span className="font-bold text-lg">Allo Inventory</span>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
