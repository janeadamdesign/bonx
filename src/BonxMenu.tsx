import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface BonxMenuProps {
  burgerToggle: boolean;
  setBurgerToggle: React.Dispatch<React.SetStateAction<boolean>>;
  logoToggle: boolean;
}

function BonxMenu(props: BonxMenuProps): React.ReactElement {
  const [menuIndex, setMenuIndex]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);

  const menuHover = (e: React.MouseEvent<HTMLParagraphElement>): void => {
    const target: HTMLParagraphElement = e.currentTarget;
    const id: number = parseInt(target.id);
    setMenuIndex(id);
  };

  const linkClick = (e: React.MouseEvent<HTMLParagraphElement>): void => {
    window.scrollTo(0, 0);
    setMenuIndex(0);
    props.setBurgerToggle(false);
  };

  // UI to reset burger toggle if click outside bounding rect of menu
  const menuRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  useEffect((): (() => void) => {
    const handleExteriorClick = (event: MouseEvent): void => {
      const target: EventTarget = event.target as EventTarget;
      if (
        props.burgerToggle &&
        !menuRef.current?.contains(target as HTMLElement)
      ) {
        props.setBurgerToggle(false);
      } else return;
    };
    document.addEventListener("mousedown", handleExteriorClick);

    return (): void => {
      document.removeEventListener("mousedown", handleExteriorClick);
    };
  }, [props.burgerToggle]);

  return (
    <div
      ref={menuRef as React.RefObject<HTMLDivElement>}
      id="menu"
      className={props.burgerToggle ? "menu-active" : "menu-passive"}
    >
      <div id="menu-content">
        <img
          alt="cross-ux"
          src="./crossux.png"
          id="crossux"
          onClick={(): void => {
            props.setBurgerToggle(false);
          }}
          className={!props.logoToggle ? "" : "graphic-fade"}
        />
        <div id="navbar-container">
          <nav id="sidebar" className={!props.logoToggle ? "" : "graphic-fade"}>
            <Link to="/">
              <p
                className={
                  menuIndex === 0
                    ? "uline"
                    : menuIndex === 1
                    ? "uline"
                    : "uline-fade"
                }
                id="1"
                onMouseOver={menuHover}
                onMouseLeave={(): void => setMenuIndex(0)}
                onClick={linkClick}
              >
                HOME
              </p>
            </Link>
            <Link to="skincare">
              <p
                className={
                  menuIndex === 0
                    ? "uline"
                    : menuIndex === 2
                    ? "uline"
                    : "uline-fade"
                }
                id="2"
                onMouseOver={menuHover}
                onMouseLeave={(): void => setMenuIndex(0)}
                onClick={linkClick}
              >
                SKINCARE
              </p>
            </Link>
            <Link to="haircare">
              <p
                className={
                  menuIndex === 0
                    ? "uline"
                    : menuIndex === 3
                    ? "uline"
                    : "uline-fade"
                }
                id="3"
                onMouseOver={menuHover}
                onMouseLeave={(): void => setMenuIndex(0)}
                onClick={linkClick}
              >
                HAIRCARE
              </p>
            </Link>
            <Link to="values">
              <p
                className={
                  menuIndex === 0
                    ? "uline"
                    : menuIndex === 4
                    ? "uline"
                    : "uline-fade"
                }
                id="4"
                onMouseOver={menuHover}
                onMouseLeave={(): void => setMenuIndex(0)}
                onClick={linkClick}
              >
                OUR VALUES
              </p>
            </Link>
            <Link to="basket">
              <p
                className={
                  menuIndex === 0
                    ? "uline"
                    : menuIndex === 5
                    ? "uline"
                    : "uline-fade"
                }
                id="5"
                onMouseOver={menuHover}
                onMouseLeave={(): void => setMenuIndex(0)}
                onClick={linkClick}
              >
                {" "}
                BASKET
              </p>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default BonxMenu;
