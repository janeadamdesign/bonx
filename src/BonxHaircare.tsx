// Module imports
import React from "react";
import { motion } from "framer-motion";

//Local imports
import ProductContainer from "./ProductContainer";
import { Animations, BasketContents, haircareProducts } from "./BonxTypes";

interface BonxHaircareProps {
  framerAnimations: Animations;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  tiny: boolean;
}

function BonxHaircare(props: BonxHaircareProps): React.ReactElement {
  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {" "}
      <div className="marquee">
        {" "}
        {props.tiny ? (
          <p className="shop-title">HAIR</p>
        ) : (
          <p className="shop-title">SHOP HAIR</p>
        )}
      </div>
      <ProductContainer
        products={haircareProducts}
        identifier="hairprod"
        framerAnimations={props.framerAnimations}
        setBasket={props.setBasket}
        basket={props.basket}
        tiny={props.tiny}
      />
      <div className="break" />
    </motion.div>
  );
}

export default BonxHaircare;
