import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { ScrollRevealInit } from '@/components/ScrollRevealInit'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
      <ScrollRevealInit />
    </>
  )
}
