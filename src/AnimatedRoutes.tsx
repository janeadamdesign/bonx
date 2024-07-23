// Package imports
import { Route, Routes, useLocation, Location } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
// Local Imports
import BonxMain from "./BonxMain";
import BonxSkincare from "./BonxSkincare";
import BonxHaircare from "./BonxHaircare";
import BonxValues from "./BonxValues";
import BonxBasket from "./BonxBasket";

interface AnimatedRoutesProps {
  scrollPositionY: number;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  tiny: boolean;
  width: number
}
interface Animations {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
}
interface BasketContents {
  [key: string]: number;
}

function AnimatedRoutes(props: AnimatedRoutesProps): React.ReactElement {
  const framerAnimations: Animations = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
  };

  const location: Location = useLocation();

  useEffect((): void => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <BonxMain
              tiny={props.tiny}
              framerAnimations={framerAnimations}
              scrollPositionY={props.scrollPositionY}
              width={props.width}
            />
          }
        />
        <Route
          path="*"
          element={
            <BonxMain
              tiny={props.tiny}
              framerAnimations={framerAnimations}
              scrollPositionY={props.scrollPositionY}
              width={props.width}
            />
          }
        />
        <Route
          path="/skincare"
          element={
            <BonxSkincare
              framerAnimations={framerAnimations}
              setBasket={props.setBasket}
              basket={props.basket}
              tiny={props.tiny}
            />
          }
        />
        <Route
          path="/haircare"
          element={
            <BonxHaircare
              framerAnimations={framerAnimations}
              setBasket={props.setBasket}
              basket={props.basket}
              tiny={props.tiny}
            />
          }
        />
        <Route
          path="/values"
          element={
            <BonxValues framerAnimations={framerAnimations} tiny={props.tiny} />
          }
        />
        <Route
          path="/basket"
          element={
            <BonxBasket
              framerAnimations={framerAnimations}
              basket={props.basket}
              setBasket={props.setBasket}
              tiny={props.tiny}
            />
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
