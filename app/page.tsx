import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { Timeline } from "@/components/timeline"
import { Capabilities } from "@/components/capabilities"
import { Contact } from "@/components/contact"
import { CursorArrow } from "@/components/cursor"

export default function Page() {
  return (
    <>
      <CursorArrow />
      <Navigation />
      <main>
        <Hero />
        <Philosophy />
        <Timeline />
        <Capabilities />
        <Contact />
      </main>
    </>
  )
}
