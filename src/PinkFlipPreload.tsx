// Module imports
import React from "react";
import ReactCardFlip from "react-card-flip";

// Local imports
import { skinIngredientMatrix } from "./Ingredients";



interface PinkFlipPreloadProps {
  skinIsFlipped: boolean;
  generateIngredients: (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ) => JSX.Element[];
  generateDescriptions: (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ) => JSX.Element;
}
interface IngredientMatrix {
    [key: string]: string;
  }

function PinkFlipPreload(props: PinkFlipPreloadProps): React.ReactElement {
  return (
    <div className="card-flip-container pink" id="flip1">
      <ReactCardFlip
        isFlipped={props.skinIsFlipped}
        flipDirection="vertical"
        containerClassName="react-card-flip"
      >
        <div className="ingredients-container-inner pink">
          <div className="ingredients-half">
            <div className="main-img" id="face1" />
          </div>
          <div className="ingredients-half ingredients-text-container">
            {" "}
            <div
              className="ingredients-text"
              style={{ opacity: props.skinIsFlipped ? 0 : 1 }}
            >
              <div className="full-ingredients">
              <p className="justify ingred-title">Our Actives</p>

                {props.generateIngredients(skinIngredientMatrix, "skin")}
              </div>
            </div>
          </div>
        </div>
        <div className="ingredients-container-inner pink">
          <div className="ingredients-half ingredients-text-container">
            {" "}
            <div className="ingredients-text">
              <div className="ingredients-description">
                {props.generateDescriptions(skinIngredientMatrix, "skin")}
              </div>
            </div>
          </div>
          <div className="ingredients-half">
            <div className="main-img" id="face1c" />
          </div>
        </div>
      </ReactCardFlip>
    </div>
  );
}

export default PinkFlipPreload