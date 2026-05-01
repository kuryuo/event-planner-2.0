import { Drawer } from "antd";
import clsx from "clsx";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Sidebar, { type SidebarProps } from "@/components/sidebar/Sidebar";
import MenuIcon from "@/assets/img/icon-m/justify.svg?react";
import shellStyles from "./AppShell.module.scss";

const NARROW_LAYOUT_QUERY = "(max-width: 1024px)";

const useIsNarrowLayout = (): boolean => {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(NARROW_LAYOUT_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW_LAYOUT_QUERY);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return narrow;
};

export type AppShellProps = {
  pageWrapperClassName: string;
  sidebarColumnClassName: string;
  sidebarProps?: SidebarProps;
  children: ReactNode;
};

export const AppShell = ({
  pageWrapperClassName,
  sidebarColumnClassName,
  sidebarProps,
  children,
}: AppShellProps) => {
  const isNarrow = useIsNarrowLayout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  const openMenu = useCallback(() => setDrawerOpen(true), []);
  const closeMenu = useCallback(() => setDrawerOpen(false), []);

  return (
    <div
      className={clsx(
        pageWrapperClassName,
        isNarrow && shellStyles.pageWrapperNarrow,
      )}
    >
      {isNarrow && (
        <button
          type="button"
          className={clsx(
            shellStyles.menuButton,
            drawerOpen && shellStyles.menuButtonHidden,
          )}
          aria-label="Открыть меню"
          aria-expanded={drawerOpen}
          onClick={openMenu}
        >
          <MenuIcon aria-hidden />
        </button>
      )}

      {!isNarrow && (
        <div className={sidebarColumnClassName}>
          <Sidebar {...sidebarProps} />
        </div>
      )}

      {isNarrow && (
        <Drawer
          open={drawerOpen}
          onClose={closeMenu}
          placement="left"
          width="100%"
          closable
          destroyOnHidden={false}
          maskClosable
          keyboard
          rootClassName={shellStyles.navDrawer}
          styles={{ body: { padding: 0 } }}
          title={null}
        >
          <div className={shellStyles.drawerSidebarHost}>
            <Sidebar {...sidebarProps} />
          </div>
        </Drawer>
      )}

      <div
        className={clsx(
          shellStyles.mainRegion,
          isNarrow && shellStyles.mainRegionMenuPad,
        )}
      >
        {children}
      </div>
    </div>
  );
};
