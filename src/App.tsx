import { SiteProvider, useSite } from "./lib/store";
import { Rail } from "./components/Rail";
import { Ticker } from "./components/Ticker";
import { Landing } from "./components/landing/Landing";
import { Featured } from "./components/Featured";
import { Experience } from "./components/experience/Experience";
import { Skills } from "./components/Skills";
import { Reviews } from "./components/reviews/Reviews";
import { Contact } from "./components/Contact";
import { AdminBar } from "./components/admin/AdminBar";

function Site() {
  const { isAdmin } = useSite();

  return (
    <>
      {/* page-wide film grain */}
      <div className="grain-fixed" aria-hidden />

      <Rail />

      <main className={isAdmin ? "pb-16" : undefined}>
        <Landing />
        <Ticker />
        <Featured />
        <Experience />
        <Skills />
        <Reviews />
        <Contact />
      </main>

      <AdminBar />
    </>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <Site />
    </SiteProvider>
  );
}
