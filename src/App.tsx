import { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { TabBar } from "./components/TabBar";
import { UpdateBanner } from "./components/UpdateBanner";
import { Add } from "./features/add/Add";
import { EditWord } from "./features/add/EditWord";
import {
  Dictionary,
  resetDictionaryFilters,
} from "./features/dictionary/Dictionary";
import { VocabDetail } from "./features/dictionary/VocabDetail";
import { Legend } from "./features/legend/Legend";
import { More } from "./features/more/More";
import { Settings } from "./features/settings/Settings";
import { Stats } from "./features/stats/Stats";
import { Study } from "./features/study/Study";
import { AppDataProvider } from "./hooks/useAppData";

/** Pages reached from the dictionary; going anywhere else resets its filters. */
const DICTIONARY_AREA = /^\/(dictionary|add|legend)(\/|$)/;

function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!DICTIONARY_AREA.test(pathname)) resetDictionaryFilters();
  }, [pathname]);
  return (
    <div className="app">
      <UpdateBanner />
      <main>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Study />} />
            {/* Old link of the former separate Lernen tab. */}
            <Route path="study" element={<Navigate to="/" replace />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="dictionary/:id" element={<VocabDetail />} />
            <Route path="legend" element={<Legend />} />
            <Route path="add" element={<Add />} />
            <Route path="dictionary/:id/edit" element={<EditWord />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
            <Route path="more" element={<More />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </HashRouter>
  );
}
