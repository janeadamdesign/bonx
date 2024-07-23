// Module imports
import React from "react";
import ReactCardFlip from "react-card-flip";

// Local imports
import { hairIngredientMatrix } from "./Ingredients";
import {IngredientMatrix} from "./BonxTypes"



interface GreenFlipPreloadProps {
  hairIsFlipped: boolean;
  generateIngredients: (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ) => JSX.Element[];
  generateDescriptions: (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ) => JSX.Element;
}


function GreenFlipPreload(props: GreenFlipPreloadProps): React.ReactElement {
  return (
    <div className="card-flip-container green" id="flip2">
    <ReactCardFlip isFlipped={props.hairIsFlipped} flipDirection="vertical">
      <div className="ingredients-container-inner green">
        <div className="ingredients-half ingredients-text-container">
          <div
            className="ingredients-text"
            style={{ opacity: props.hairIsFlipped ? 0 : 1 }}
          >
            <div className="full-ingredients">
            <p className="justify ingred-title">Our Actives</p>

              {props.generateIngredients(hairIngredientMatrix, "hair")}
            </div>
          </div>
        </div>

        <div className="ingredients-half">
          <div className="main-img" id="hair1" />
        </div>
      </div>
      <div className="ingredients-container-inner green">
        <div className="ingredients-half">
          <div className="main-img" id="hair2" />
        </div>

        <div className="ingredients-half ingredients-text-container">
          {" "}
          <div className="ingredients-text">
            <div className="ingredients-description">
              {props.generateDescriptions(hairIngredientMatrix, "hair")}
            </div>
          </div>
        </div>
      </div>
    </ReactCardFlip>
  </div>
  )
  

}

export default GreenFlipPreload