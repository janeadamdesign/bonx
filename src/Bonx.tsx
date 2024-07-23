//Package Imports
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import throttle from "lodash.throttle";
import Cookies from "js-cookie";

// Local Imports
import "./Bonx.css";
import "./rtgTransitions.scss";
import BonxHead from "./BonxHead";
import BonxFoot from "./BonxFoot";
import AnimatedRoutes from "./AnimatedRoutes";
import { BasketContents } from "./BonxTypes";

interface BonxProps {}

function Bonx(props: BonxProps): React.ReactElement {


  // Global state for basket
  const [basket, setBasket]: [
    BasketContents,
    React.Dispatch<React.SetStateAction<BasketContents>>
  ] = useState<BasketContents>((): BasketContents => {
    const savedBasket: string | undefined = Cookies.get("basket");
    return savedBasket ? JSON.parse(savedBasket) : {};
  });

  useEffect((): void => {
    Cookies.set("basket", JSON.stringify(basket), { expires: 7 });
  }, [basket]);

  // Use Effect to force scroll to top immediatley before refresh
  useEffect((): (() => void) => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.onbeforeunload = (): void => {
      window.scrollTo(0, 0);
    };
    return (): void => {
      window.onbeforeunload = null;
      window.history.scrollRestoration = "auto";
    };
  }, []);

  //Scroll Logic
  const [scrollPositionY, setScrollPositionY]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const handleScrollY: (e: Event) => void = throttle((e: Event): void => {
    setScrollPositionY(window.scrollY || document.documentElement.scrollTop);
  }, 15);
  useEffect((): (() => void) => {
    window.addEventListener("scroll", handleScrollY);
    return (): void => {
      window.removeEventListener("scroll", handleScrollY);
    };
  }, [handleScrollY]);
  // Passing state up for colour:
  const [colour, setColour]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("cyan");
  useEffect((): void => {
    console.log(`Colour changed to: ${colour}`);
  }, [colour]);

  // Responsivity Logic
  const [width, setWidth]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(window.innerWidth);
  const [tiny, setTiny]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): (() => void) => {
    const resize = (): void => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", resize);
    return (): void => {
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect((): void => {
    if (width < 800) {
      setTiny(true);
    } else setTiny(false);
  }, [width]);

  return (
    <div className="App">
      <Router>
        <BonxHead
          scrollPositionY={scrollPositionY}
          setColour={setColour}
          basket={basket}
        />
        <div id="offset">
          <AnimatedRoutes
            scrollPositionY={scrollPositionY}
            basket={basket}
            setBasket={setBasket}
            tiny={tiny}
            width={width}
          />
        </div>
        <BonxFoot colour={colour} />
      </Router>
    </div>
  );
}

export default Bonx;
