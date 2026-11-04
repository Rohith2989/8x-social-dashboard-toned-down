"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { BRAND } from "@/lib/demo";
import { Icon } from "../ui/icon";
import { ToastProvider } from "../ui/toast";
import { Aura } from "./aura";
import { Sidebar } from "./sidebar";
import { SearchDialog } from "./search";
import { StartDialog } from "./start";
import styles from "./shell.module.css";

/*
  The frame every page of the brand's dashboard sits in: the app as one rounded window floating in the vertical's
  night aura (Halo Lab's dashboards, the user's references), the sidebar down its left; inside, the window is light. It lives in the root layout,
  so moving between pages keeps the window, the aura and the sidebar still and swaps only what is inside: each page
  gives the window its tray (the soft inset panel that scrolls) and its right-hand column.
  Below 1200 px the sidebar folds to a rail; on a phone the window opens out to the whole screen and the sidebar
  becomes a drawer, opened from the menu button at the top of each page.
*/

const MenuContext = createContext<() => void>(() => {});

export const useMenu = () => useContext(MenuContext);

// the window's own dialogs, which any page opens: search (also ⌘K / Ctrl K) and Start a campaign
const ActionsContext = createContext<{ search: () => void; start: () => void }>({ search: () => {}, start: () => {} });

export const useShellActions = () => useContext(ActionsContext);

export function Shell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(0);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((n) => (n > 0 ? 0 : Date.now()));
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  return (
    <div className={styles.stage}>
      <div className={styles.backdrop} aria-hidden>
        <Aura recipe="night" className={styles.aura} />
      </div>
      <ToastProvider>
        <ActionsContext.Provider value={{ search: () => setSearch(Date.now()), start: () => setStart(true) }}>
          <div className={styles.window}>
            <Sidebar open={menu} onClose={() => setMenu(false)} />
            <MenuContext.Provider value={() => setMenu(true)}>{children}</MenuContext.Provider>
          </div>
          {/* a fresh search each time it opens */}
          <SearchDialog key={search} open={search > 0} onClose={() => setSearch(0)} />
          <StartDialog open={start} onClose={() => setStart(false)} />
        </ActionsContext.Provider>
      </ToastProvider>
    </div>
  );
}

// the soft inset panel a page's story scrolls in
export function Tray({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className={styles.tray}>
      <main className={styles.scroll} id="main" aria-label={label}>
        <MobileBar />
        {children}
      </main>
    </div>
  );
}

// the window's right-hand column (hidden below 1360 px, where each page brings its content into the tray instead)
export function Aside({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <aside className={styles.aside} aria-label={label}>
      {children}
    </aside>
  );
}

function MobileBar() {
  const open = useMenu();
  return (
    <div className={styles.mobileBar}>
      <button type="button" className={styles.menu} onClick={open} aria-label="Open menu" data-anim-host>
        <Icon name="menu" />
      </button>
      <img src="/brand/social-lockup-ink.svg" alt="Social" width={97} height={22} />
      <img src={BRAND.mark} alt="" width={32} height={32} className={styles.mobileMark} />
    </div>
  );
}

// a page's title, the line under it, and the page's own actions
export function PageHeader({ title, line, children }: { title: string; line: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className={styles.header}>
      <div>
        <h1>{title}</h1>
        <p>{line}</p>
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className={styles.footer}>
      <span>Sample data. Real campaigns show their own numbers here.</span>
      <span>© 2026 8x Social Inc.</span>
    </footer>
  );
}

// the square button beside a page's actions (search)
export function SquareButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" className={styles.square} aria-label={label} onClick={onClick} data-anim-host>
      {icon}
    </button>
  );
}
