import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { siteConfig } from '@/config/site'
import './globals.css'

const clashDisplay = localFont({
  src: [
    { path: '../fonts/ClashDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/ClashDisplay-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/ClashDisplay-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})

const switzer = localFont({
  src: [
    { path: '../fonts/Switzer-Light.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/Switzer-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Switzer-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Switzer-Semibold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${clashDisplay.variable} ${switzer.variable} ${GeistMono.variable} grain`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
