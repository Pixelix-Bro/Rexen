import Navbar from '@/components/Navbar/Navbar'
import LenisProvider from '@/components/lenis/LenisProvider'
import JsonLd from '@/components/JsonLd'
import { metadata as siteMetadata, viewport as siteViewport } from '@/lib/metadata'
import './globals.css'

export const metadata = siteMetadata
export const viewport = siteViewport

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <Navbar />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
