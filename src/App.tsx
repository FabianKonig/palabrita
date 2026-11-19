import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { TabBar } from "./components/TabBar";
import { Logo } from "./components/Brand";
import { UpdateBanner } from "./components/UpdateBanner";
import {
  WelcomeOverlay,
  type WelcomeOutletContext,
} from "./components/WelcomeOverlay";
import { isWelcomeSeen, markWelcomeSeen } from "./data/welcomeFlag";
import { Add } from "./features/add/Add";
import { EditWord } from "./features/add/EditWord";
import { Dictionary } from "./features/dictionary/Dictionary";
import { onNavigate } from "./features/dictionary/viewState";
import { VocabDetail } from "./features/dictionary/VocabDetail";
import { Legend } from "./features/legend/Legend";
import { Imprint } from "./features/legal/Imprint";
import { Privacy } from "./features/legal/Privacy";
import { More } from "./features/more/More";
import { Settings } from "./features/settings/Settings";
import { Stats } from "./features/stats/Stats";
import { Study } from "./features/study/Study";
import { AppDataProvider } from "./hooks/useAppData";

function Layout() {
  const { pathname } = useLocation();
  const [welcomeSeen, setWelcomeSeen] = useState(() => isWelcomeSeen());
  // Vom Markenkopf im Tab „Mehr“ erneut geöffnet; speichert nichts.
  const [welcomeReplay, setWelcomeReplay] = useState(false);
  useEffect(() => {
    onNavigate(pathname);
  }, [pathname]);
  const openWelcome = useCallback(() => setWelcomeReplay(true), []);
  const closeWelcomeReplay = useCallback(() => setWelcomeReplay(false), []);
  const outletContext = useMemo<WelcomeOutletContext>(
    () => ({ openWelcome }),
    [openWelcome],
  );
  // Erststart-Begrüßung liegt über der Lernseite; die App dahinter ist solange gesperrt.
  const showWelcome = pathname === "/" && !welcomeSeen;
  return (
    <>
      <div className="app" inert={showWelcome || welcomeReplay}>
        <UpdateBanner />
        <main>
          {/* Logo oben rechts auf allen Seiten außer „Mehr“ (dort steht der große Markenkopf). */}
          {pathname !== "/more" && <Logo className="corner-logo" />}
          <Outlet context={outletContext} />
        </main>
        <TabBar />
      </div>
      {showWelcome && (
        <WelcomeOverlay
          onDismiss={() => {
            markWelcomeSeen();
            setWelcomeSeen(true);
          }}
        />
      )}
      {!showWelcome && welcomeReplay && (
        <WelcomeOverlay closeOnBackdrop onDismiss={closeWelcomeReplay} />
      )}
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Study />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="dictionary/:id" element={<VocabDetail />} />
            <Route path="legend" element={<Legend />} />
            <Route path="add" element={<Add />} />
            <Route path="dictionary/:id/edit" element={<EditWord />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
            <Route path="more" element={<More />} />
            <Route path="imprint" element={<Imprint />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </HashRouter>
  );
}
