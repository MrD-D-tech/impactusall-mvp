import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'ImpactusAll - Transforming Generosity Into Impact Stories',
  description: 'Discover the real impact of corporate donations through authentic stories from UK charities. See how generosity transforms lives.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'ImpactusAll - Transforming Generosity Into Impact Stories',
    description: 'Discover the real impact of corporate donations through authentic stories from UK charities.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImpactusAll - Transforming Generosity Into Impact Stories',
    description: 'Discover the real impact of corporate donations through authentic stories from UK charities.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#fff',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}