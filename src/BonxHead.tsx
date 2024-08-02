//Package Imports
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
// Local import
import BonxMenu from "./BonxMenu";
import { BasketContents } from "./BonxTypes";

interface BonxHeadProps {
  scrollPositionY: number;
  setColour: React.Dispatch<React.SetStateAction<string>>;
  basket: BasketContents;
  tiny: boolean;
}

function BonxHead(props: BonxHeadProps): React.ReactElement {
  // Header Colour Change Logic
  const [headerColourToggle, setHeaderColourToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const [logoToggle, setLogoToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  // Menu Toggle Logic
  const [burgerToggle, setBurgerToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  // Passing colour state up
  useEffect((): void => {
    if (headerColourToggle || burgerToggle) {
      props.setColour("green");
    } else props.setColour("cyan");
  }, [headerColourToggle, burgerToggle]);

  // Logo Animation Logic 2
  const [logoSwitch, setLogoSwitch]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): void => {
    const logoSwitchFunction = (): void => {
      const logoSwitchConstant: number = 25;
      const viewportInPixels: number = window.innerHeight;
      const constantInPixels: number =
        (viewportInPixels * logoSwitchConstant) / 100;
      if (logoToggle === true) {
        setLogoSwitch(false);
        return;
      } else if (props.scrollPositionY > constantInPixels) {
        setLogoSwitch(true);
      } else setLogoSwitch(false);
    };
    logoSwitchFunction();
  }, [logoToggle, props.scrollPositionY]);

  // Basket Count
  const [basketCount, setBasketCount]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const basketCounterRef: React.RefObject<HTMLParagraphElement | null> =
    useRef<HTMLParagraphElement | null>(null);
  const shopLogoRef: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);

  useEffect((): void | (() => void) => {
    if (!basketCounterRef.current || !shopLogoRef.current) return;
    basketCounterRef.current.style.transform = "scale(1.3, 1.56";
    shopLogoRef.current.style.animation = "spin 0.25s ease-in-out";
    if (!headerColourToggle) {
      setHeaderColourToggle(true);
    }
    const basketCountTimer: NodeJS.Timeout | number = setTimeout((): void => {
      if (!basketCounterRef.current || !shopLogoRef.current) return;
      basketCounterRef.current.style.transform = "scale(1, 1.2)";
      setHeaderColourToggle(false);
      shopLogoRef.current.style.animation = "";
    }, 250);
    return (): void => {
      clearTimeout(basketCountTimer);
    };
  }, [basketCount]);

  useEffect((): void => {
    const total: number = Object.values(props.basket).reduce(
      (acc: number, value: number): number => acc + value,
      0
    );
    setBasketCount(total);
  }, [props.basket]);

  const mouseLogoContent: {} | null = props.tiny ? null : {
    onMouseEnter: (): void => {
      setLogoToggle(true);
    },
    onMouseLeave: (): void => {
      setLogoToggle(false);
    },
  };

  return (
    <>
      <BonxMenu
        logoToggle={logoToggle}
        burgerToggle={burgerToggle}
        setBurgerToggle={setBurgerToggle}
      />
      <header
        id="bonx-head"
        className={
          headerColourToggle ? "green" : burgerToggle ? "green" : "cyan"
        }
      >
        <div
          id="burger-logo"
          className={
            !logoToggle ? "graphic-container" : "graphic-container graphic-fade"
          }
          onMouseEnter={(): void => {
            setHeaderColourToggle(true);
          }}
          onMouseLeave={(): void => {
            setHeaderColourToggle(false);
          }}
          onClick={(): void => {
            setBurgerToggle(true);
          }}
        >
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </div>
        <Link to="/" id="logo-container-link">
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={logoSwitch ? "1" : "2"}
              timeout={500}
              classNames="fade"
            >
              {logoSwitch ? (
                <img
                  alt="logo"
                  src="/bonxlogo.png"
                  id="logo"
                  {...mouseLogoContent}
                />
              ) : (
                <img
                  alt="logob"
                  src="/bonxlogob.png"
                  id="logob"
                  {...mouseLogoContent}
                />
              )}
            </CSSTransition>
          </SwitchTransition>
        </Link>
        <div
          className={
            !logoToggle ? "graphic-container" : "graphic-container graphic-fade"
          }
        >
          <div id="basket-count-container">
            <p
              id="head-basket-counter"
              style={{ opacity: basketCount === 0 ? 0 : 1 }}
              ref={basketCounterRef as React.RefObject<HTMLParagraphElement>}
            >
              {basketCount < 10 ? (
                <>
                  <span style={{ opacity: 0 }}>1</span>
                  {basketCount}
                </>
              ) : (
                basketCount
              )}
            </p>

            <Link to="/basket" id="basket-container-link">
              <img
                alt="shop-logo"
                src="/basket3.png"
                id="shop-logo"
                ref={shopLogoRef as React.RefObject<HTMLImageElement>}
                onMouseEnter={(): void => {
                  setHeaderColourToggle(true);
                }}
                onMouseLeave={(): void => {
                  setHeaderColourToggle(false);
                }}
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default BonxHead;
