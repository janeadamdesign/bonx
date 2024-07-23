// Module imports
import React from "react";
import { motion } from "framer-motion";

// Local imports
import ProductContainer from "./ProductContainer";
import { Animations, BasketContents, skincareProducts } from "./BonxTypes";

interface BonxSkincareProps {
  framerAnimations: Animations;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  tiny: boolean;
}

function BonxSkincare(props: BonxSkincareProps): React.ReactElement {
  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {" "}
      <div className="marquee">
        {" "}
        {props.tiny ? (
          <p className="shop-title">SKIN</p>
        ) : (
          <p className="shop-title">SHOP SKIN</p>
        )}
      </div>
      <ProductContainer
        products={skincareProducts}
        identifier="skin"
        framerAnimations={props.framerAnimations}
        setBasket={props.setBasket}
        basket={props.basket}
        tiny={props.tiny}
      />
      <div className="break" />
    </motion.div>
  );
}

export default BonxSkincare;
