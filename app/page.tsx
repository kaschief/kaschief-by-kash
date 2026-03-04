import { CursorArrow, Navigation, Contact, Hero, Methods, Philosophy, Timeline } from "@components";
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
