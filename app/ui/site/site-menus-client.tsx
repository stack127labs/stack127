"use client";

import { ChevronDown } from "@/app/ui/icons";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cardIcon } from "@/lib/card-icons";
import { createSiteMenusLoader, siteMenuSection, type SiteMenuItem, type SiteMenus, type SiteMenuSection } from "@/lib/site-menus";
import { PathnameSidebarList } from "./pathname-sidebar-list";
import type { SidebarListItem } from "./sidebar-list";
import styles from "./site-menus.module.css";

/** "all" is the single menu on phones, which shows both lists. */
type OpenMenu = SiteMenuSection | "all" | null;

// Matches the 680px breakpoint in site-menus.module.css.
const PHONE_QUERY = "(max-width: 680px)";
const menuIds: SiteMenuSection[] = ["tools", "directories"];

// A shared promise deduplicates idle/open requests and survives client navigation.
const loadMenus = createSiteMenusLoader(async () => {
  const response = await fetch("/site-menus.json");
  if (!response.ok) throw new Error(`Site menus failed with status ${response.status}.`);
  return await response.json() as SiteMenus;
});

function listItems(items: SiteMenuItem[]): SidebarListItem[] {
  return items.map((item) => {
    const Icon = cardIcon(item.iconKey);
    return {
      href: item.href,
      label: item.label,
      icon: <Icon size={15} strokeWidth={2.2} />,
      count: item.count === null ? undefined : item.count.toLocaleString("en-US"),
    };
  });
}

function visible(elements: Iterable<HTMLElement>) {
  return [...elements].filter((element) => element.getClientRects().length > 0);
}

/**
 * Disclosure menus with links, not role="menu". Click, Enter, Space, or
 * ArrowDown opens one. Arrow keys, Home, and End move through its links. Escape
 * closes it and returns focus to its button. A click outside, focus leaving, or
 * opening the other menu closes it.
 */
export function SiteMenusClient() {
  const pathname = usePathname();
  const [menus, setMenus] = useState<SiteMenus | null>(null);
  const [failed, setFailed] = useState(false);
  const section = menus ? siteMenuSection(pathname, menus) : null;
  const [open, setOpen] = useState<OpenMenu>(null);
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRefs = useRef<Record<string, HTMLElement | null>>({});
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const mounted = useRef(false);
  const requestMenus = useCallback(() => {
    setFailed(false);
    void loadMenus().then(
      (data) => { if (mounted.current) setMenus(data); },
      () => { if (mounted.current) setFailed(true); },
    );
  }, []);

  useEffect(() => {
    mounted.current = true;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(requestMenus, { timeout: 2000 });
      } else {
        timer = setTimeout(requestMenus, 200);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      mounted.current = false;
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [requestMenus]);

  const content = menus ? {
    tools: <PathnameSidebarList items={listItems(menus.tools)} />,
    directories: <>
      <PathnameSidebarList items={listItems(menus.directories)} />
      {menus.more.length ? <div className={styles.more}>
        <PathnameSidebarList items={listItems(menus.more)} />
      </div> : null}
    </>,
  } : null;

  const links = (menu: OpenMenu) => {
    const container = menu ? containerRefs.current[menu] : null;
    return container ? visible(container.querySelectorAll<HTMLElement>("a[href]")) : [];
  };

  const focusLink = (menu: OpenMenu, position: "first" | "last") => {
    const items = links(menu);
    items[position === "first" ? 0 : items.length - 1]?.focus();
  };

  // A layout change between the phone menu and the two menus closes whatever is open.
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const close = () => setOpen(null);
    phone.addEventListener("change", close);
    return () => phone.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (menus && pendingFocus.current) {
      focusLink(open, pendingFocus.current);
      pendingFocus.current = null;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setOpen(null);
      triggerRefs.current[open]?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, menus]);

  const toggle = (menu: Exclude<OpenMenu, null>) => {
    pendingFocus.current = null;
    if (open !== menu && !menus) requestMenus();
    setOpen((current) => (current === menu ? null : menu));
  };

  const openWithFocus = (menu: Exclude<OpenMenu, null>, position: "first" | "last") => {
    if (open === menu && menus) {
      focusLink(menu, position);
      return;
    }
    if (!menus) requestMenus();
    pendingFocus.current = position;
    setOpen(menu);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const triggerMenu = target.dataset.menuTrigger as Exclude<OpenMenu, null> | undefined;

    if (triggerMenu) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openWithFocus(triggerMenu, event.key === "ArrowDown" ? "first" : "last");
      } else if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && triggerMenu !== "all") {
        // Left and right move between the two menu buttons.
        event.preventDefault();
        const other = menuIds.find((menu) => menu !== triggerMenu);
        if (other) triggerRefs.current[other]?.focus();
      }
      return;
    }

    if (!open || target.tagName !== "A") return;
    const items = links(open);
    const index = items.indexOf(target);
    if (index < 0) return;
    const move = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 }[event.key];
    if (move === undefined) return;
    event.preventDefault();
    items[(move + items.length) % items.length]?.focus();
  };

  // Focus that moves to another part of the page closes the menu. Clicks on
  // empty parts of a panel blur to nothing, so they keep it open.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !event.currentTarget.contains(next)) setOpen(null);
  };

  // A chosen link closes the menu before the next page loads.
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a[href]")) setOpen(null);
  };

  const groupId = `${baseId}-menus`;

  return (
    <div
      className={styles.root}
      data-menus-open={open ?? undefined}
      onBlur={onBlur}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={rootRef}
    >
      <button
        aria-controls={groupId}
        aria-expanded={open === "all"}
        className={`${styles.trigger} ${styles.allTrigger}`}
        data-active={section ? "" : undefined}
        data-menu-trigger="all"
        onClick={() => toggle("all")}
        ref={(node) => {
          triggerRefs.current.all = node;
        }}
        type="button"
      >
        menu
        <ChevronDown aria-hidden="true" className={styles.chevron} size={14} strokeWidth={2} />
      </button>
      <div
        className={styles.group}
        id={groupId}
        ref={(node) => {
          containerRefs.current.all = node;
        }}
      >
        {menuIds.map((menu) => {
          const panelId = `${baseId}-${menu}`;
          return (
            <div className={styles.menu} key={menu}>
              <button
                aria-controls={panelId}
                aria-expanded={open === menu}
                className={styles.trigger}
                data-active={section === menu ? "" : undefined}
                data-menu-trigger={menu}
                onClick={() => toggle(menu)}
                ref={(node) => {
                  triggerRefs.current[menu] = node;
                }}
                type="button"
              >
                {menu}
                <ChevronDown aria-hidden="true" className={styles.chevron} size={14} strokeWidth={2} />
              </button>
              <div
                className={styles.panel}
                hidden={open !== menu && open !== "all"}
                id={panelId}
                ref={(node) => {
                  containerRefs.current[menu] = node;
                }}
              >
                <p className={styles.heading} data-active={section === menu ? "" : undefined}>{menu}</p>
                {content ? content[menu] : open === menu || open === "all" ? (
                  <div className={styles.status} role="status">
                    {failed ? <>Couldn’t load menus. <button onClick={requestMenus} type="button">Retry</button></> : "Loading…"}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
