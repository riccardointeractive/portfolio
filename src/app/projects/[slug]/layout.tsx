import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
