import { CursorArrow, Navigation } from "@/components/layout";
import { Contact, Hero, Methods, Philosophy, Timeline } from "@/components/sections";

export default function Page() {
  return (
    <>
      <CursorArrow />
      <Navigation />
      <main>
        <Hero />
        <Philosophy />
        <Timeline />
        <Methods />
        <Contact />
      </main>
    </>
  );
}
