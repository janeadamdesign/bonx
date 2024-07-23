//Package Imports
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated, SpringValues } from "react-spring";
import { useNavigate, NavigateFunction } from "react-router-dom";
import ReactCardFlip from "react-card-flip";

//Local Imports
import PinkFlipPreload from "./PinkFlipPreload";
import GreenFlipPreload from "./GreenFlipPreload";
import Text3D from "./Text3D";
import {
  Animations,
  OpacitySpring,
  ClipSpring,
  ClipPath,
  IngredientMatrix,
  IntersectionOptions,
} from "./BonxTypes";

interface BonxMainProps {
  framerAnimations: Animations;
  scrollPositionY: number;
  tiny: boolean;
  width: number;
}

function BonxMain(props: BonxMainProps): React.ReactElement {
  //Image preloading
  const storeImages = (
    srcArray: string[],
    stateSetter: React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ): void => {
    const handleImageLoad = (image: HTMLImageElement): void => {
      stateSetter((prev: HTMLImageElement[]): HTMLImageElement[] => {
        if (
          prev.find(
            (extantImg: HTMLImageElement): boolean =>
              extantImg.src === image.src
          )
        ) {
          return prev;
        } else return [...prev, image];
      });
    };
    srcArray.forEach((src: string): void => {
      // console.log(src);
      const img: HTMLImageElement = new Image();
      img.src = src;
      img.onload = (): void => handleImageLoad(img);
    });
  };
  const [mainPageImages, setMainPageImages]: [
    HTMLImageElement[],
    React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ] = useState<HTMLImageElement[]>([]);
  const mainPageUrls: string[] = [
    "./trio2b.png",
    "./trio1.png",
    "./emollient3.png",
    "./emollient2.png",
  ];
  useEffect((): void => {
    storeImages(mainPageUrls, setMainPageImages);
  }, []);

  // Logic to fade in top images
  const [imgFadeToggle, setImgFadeToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const [imgFadeToggleNo, setImgFadeToggleNo]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const fadeInBanner: SpringValues<ClipSpring> = useSpring<ClipSpring>({
    to: { clipPath: "inset(-10% 0% -10% 0%)" },
    from: { clipPath: "inset(-10% 100% -10% 0%)" },
    reset: false,
    delay: 250,
    config: {
      tension: 170,
      friction: 26,
      mass: 1,
      duration: 250,
    },
  });
  const fadeInPicture: SpringValues<OpacitySpring> = useSpring<OpacitySpring>({
    to: { clipPath: "inset(-10% 0% -10% 0%)", opacity: 1 },
    from: { clipPath: "inset(-10% 100% -10% 0%)", opacity: 0.5 },
    reset: false,
    delay: 0,
    config: {
      tension: 170,
      friction: 26,
      mass: 1,
      duration: 250,
    },
  });
  const fadeInLandscape: SpringValues<OpacitySpring> = useSpring<OpacitySpring>(
    {
      to: { clipPath: "inset(-10% 0 -10% 0)", opacity: 1 },
      from: { clipPath: "inset(-10% 100% -10% 0)", opacity: 0.5 },
      reset: false,
      delay: 0,
      config: {
        tension: 170,
        friction: 26,
        mass: 1,
        duration: 250,
      },
    }
  );
  const [replacementStyle, setReplacementStyle]: [
    ClipPath,
    React.Dispatch<React.SetStateAction<ClipPath>>
  ] = useState<ClipPath>({
    clipPath: `inset(-10% 100% -10% 0)`,
  });
  const customFadeReplacement = (): void => {
    if (imgFadeToggle === false) {
      setReplacementStyle({ clipPath: `inset(-10% 0% -10% 0)` });
    } else {
      setReplacementStyle({ clipPath: `inset(-10% 100% -10% 0)` });
    }
  };
  useEffect((): (() => void) => {
    const imgTimeout: number | NodeJS.Timeout = setTimeout(() => {
      console.log(`setting toggle`);
      setImgFadeToggle((prev: boolean): boolean => !prev);
      setImgFadeToggleNo((prev: number): number => prev + 1);
      customFadeReplacement();
    }, 3000);
    return (): void => {
      clearTimeout(imgTimeout);
    };
  }, [imgFadeToggle, imgFadeToggleNo]);

  // Logic to Flip 16:9 Cards
  const [skinIsFlipped, setSkinIsFlipped]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const [hairIsFlipped, setHairIsFlipped]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const skinFlipperFunction = (e: React.MouseEvent): void => {
    const target: HTMLSpanElement = e.currentTarget as HTMLSpanElement;
    setSkinIsFlipped(true);
    setSkinDescriptionIndex(parseInt(target.id));
    console.log(`set skin description to ${target.id}`);
  };
  const hairFlipperFunction = (e: React.MouseEvent): void => {
    const target: HTMLSpanElement = e.currentTarget as HTMLSpanElement;
    setHairIsFlipped(true);
    setHairDescriptionIndex(parseInt(target.id));
    console.log(`set skin description to ${target.id}`);
  };

  // Logic related to Card Text categories
  const [skinDescriptionIndex, setSkinDescriptionIndex]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const [hairDescriptionIndex, setHairDescriptionIndex]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const generateIngredients = (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ): JSX.Element[] => {
    let jsx: JSX.Element[] = [<></>];
    const span = (
      flipperFunction: (e: React.MouseEvent) => void,
      el: IngredientMatrix,
      index: number
    ): JSX.Element => {
      return (
        <span
          className="ingred-span"
          id={index.toString()}
          key={index.toString()}
          onClick={flipperFunction}
        >
          <p className="list-ingred">{Object.keys(el)[0]}</p>
          <p className="arrow">→</p>
        </span>
      );
    };
    switch (identifier) {
      case "skin":
        jsx = ingredientsArray.map(
          (el: IngredientMatrix, index: number): JSX.Element => {
            return span(skinFlipperFunction, el, index);
          }
        );
        break;
      case "hair":
        jsx = ingredientsArray.map(
          (el: IngredientMatrix, index: number): JSX.Element => {
            return span(hairFlipperFunction, el, index);
          }
        );
        break;
    }
    return jsx;
  };
  const generateDescriptions = (
    ingredientsArray: IngredientMatrix[],
    identifier: string
  ): JSX.Element => {
    const skinObj: IngredientMatrix = ingredientsArray[skinDescriptionIndex];
    const hairObj: IngredientMatrix = ingredientsArray[hairDescriptionIndex];
    let jsx: JSX.Element = <></>;
    const span = (
      setFlipper: React.Dispatch<React.SetStateAction<boolean>>,
      obj: IngredientMatrix
    ): JSX.Element => {
      return (
        <span className="description-span">
          <span className="back-arrow-container">
            <p
              className="back-arrow"
              onClick={(): void => {
                setFlipper(false);
              }}
            >
              ←
            </p>
          </span>
          <p className="justify ingred-title">{Object.keys(obj)[0]}</p>
          <p className="justify ingred-descr">{obj[Object.keys(obj)[0]]}</p>
        </span>
      );
    };
    switch (identifier) {
      case "skin":
        jsx = span(setSkinIsFlipped, skinObj);
        break;
      case "hair":
        jsx = span(setHairIsFlipped, hairObj);
    }
    return jsx;
  };

  useEffect((): void => {
    console.log(`hair index has just been set to: ${hairDescriptionIndex}`);
  }, [hairDescriptionIndex]);

  useEffect((): void => {
    console.log(`skin index has just been set to: ${skinDescriptionIndex}`);
  }, [skinDescriptionIndex]);

  /* Logic related to scroll-triggered card animations (all)
  1. Declare divs as refs & establish flip state for square cards */
  const skinCardRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const hairCardRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const twinCardRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const [skinSquareFlipped, setSkinSquareFlipped]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(true);
  const [hairSquareFlipped, setHairSquareFlipped]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(true);
  // 2. Create intersection options objects for both fns.
  const intersectionOptions: IntersectionOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };
  const squareOptions: IntersectionOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.75,
  };
  // 3. fn. for intersection callbacks. twinCardIntersectionCallback now modular due to timer ref
  const intersectionCallbackFunction = (
    entries: IntersectionObserverEntry[]
  ): void => {
    entries.forEach((entry: IntersectionObserverEntry): void => {
      const target: HTMLDivElement = entry.target as HTMLDivElement;
      if (entry.isIntersecting) {
        console.log(`${entry.target.id} has entered the chat`);
        target.style.transform = `translateX(0)`;
        target.style.clipPath = `inset(-10% 0 -10% 0)`;
      } else if (target.id === "skin-card-container") {
        target.style.clipPath = `inset(-10% 50% -10% 0)`;
        target.style.transform = `translateX(50%)`;
      } else {
        target.style.clipPath = `inset(-10% 0 -10% 50%)`;
        target.style.transform = `translateX(-50%)`;
      }
    });
  };
  const twinTimerRef: React.MutableRefObject<NodeJS.Timeout | number | null> =
    useRef<NodeJS.Timeout | number | null>(null);
  const twinCardIntersectionCallback = (
    entries: IntersectionObserverEntry[]
  ): void => {
    entries.forEach((entry: IntersectionObserverEntry): void => {
      if (!twinCardRef.current) return;
      if (entry.isIntersecting) {
        twinCardRef.current.style.opacity = "1";
        setSkinSquareFlipped(false);
        twinTimerRef.current = setTimeout((): void => {
          setHairSquareFlipped(false);
        }, 250);
      } else {
        twinCardRef.current.style.opacity = "0";
        setHairSquareFlipped(true);
        setSkinSquareFlipped(true);
      }
    });
  };
  // 4. Overall useEffect for all of our intersection observers.
  useEffect((): (() => void) => {
    const observer: IntersectionObserver = new IntersectionObserver(
      intersectionCallbackFunction,
      intersectionOptions
    );
    if (skinCardRef.current && hairCardRef.current) {
      observer.observe(skinCardRef.current);
      observer.observe(hairCardRef.current);
    }
    const squareObserver: IntersectionObserver = new IntersectionObserver(
      twinCardIntersectionCallback,
      squareOptions
    );
    if (twinCardRef.current) {
      squareObserver.observe(twinCardRef.current);
    }
    return (): void => {
      if (twinTimerRef.current) {
        clearTimeout(twinTimerRef.current);
      }
      observer.disconnect();
      squareObserver.disconnect();
    };
  }, [props.tiny]);

  // Simple state declaration to store whether square cards hovered: affects styling of element NOT hovered
  const [squareOpacityIndex, setSquareOpacityIndex]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);

  /* A simple effect in order to flip and then unflip all of our cards immediately upon page load. Improves UX by preloading content on obverse of card. */
  useEffect((): (() => void) => {
    setSkinIsFlipped(true);
    setHairIsFlipped(true);
    setSkinSquareFlipped(false);
    setHairSquareFlipped(false);
    const flipTimeout: number | NodeJS.Timeout = setTimeout((): void => {
      setSkinIsFlipped(false);
      setHairIsFlipped(false);
      setSkinSquareFlipped(true);
      setHairSquareFlipped(true);
    }, 175);
    return (): void => clearTimeout(flipTimeout);
  }, []);

  // Logic relating to router path
  const navigate: NavigateFunction = useNavigate();
  const goTo = (path: string): void => {
    navigate(path);
  };

  // Logic for animation
  useEffect((): (() => void) => {
    const percentage: number = (1 / props.width) * 300000;
    const styleSheet: HTMLElement = document.createElement("style");
    styleSheet.textContent = `@keyframes scroll-text {
      from { 
        transform: translateX(100%); 
      }
      to { 
        transform: translateX(-${percentage}%); 
      }
    }`;
    document.head.appendChild(styleSheet);
    return (): void => {
      styleSheet.remove();
    };
  }, [props.width]);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {" "}
      <div className="hidden-div">
        <PinkFlipPreload
          skinIsFlipped={skinIsFlipped}
          generateIngredients={generateIngredients}
          generateDescriptions={generateDescriptions}
        />
        <GreenFlipPreload
          hairIsFlipped={hairIsFlipped}
          generateIngredients={generateIngredients}
          generateDescriptions={generateDescriptions}
        />
      </div>
      <div id="blocks-container">
        <animated.div style={fadeInBanner} className="colour-block" id="block1">
          <div
            className="gradient-child"
            style={{
              background: "linear-gradient(to right, #ffbed8, #f78fa7)",
            }}
          />
          <div
            className="gradient-child"
            style={{
              background: "linear-gradient(to right, #d7f8ba, #8ccfa0)",
            }}
          />
        </animated.div>
        <div className="colour-block" id="block2">
            
              <motion.div
                initial={{ clipPath: "inset(-10% 100% -10% 0)", opacity: 0.5 }}
                animate={{ clipPath: "inset(-10% 0 -10% 0)", opacity: 1 }}
                transition={{
                  ease: "easeInOut",
                  duration: 0.25,
                }}
                className="main-img"
                id="trio2b"
              >
                <div
                  className="main-img img-transition"
                  id="trio1"
                  style={replacementStyle}
                />
              </motion.div>
            
        </div>
        <div className="colour-block" id="block3">
          <animated.div
            style={fadeInPicture}
            id="emollient"
            className="main-img"
          >
            {" "}
            <div
              className="main-img img-transition"
              id="emollient2"
              style={replacementStyle}
            />
          </animated.div>
        </div>
      </div>
      <div className="marquee sassy-container">
        <p id="sassy">Sassy Skincare for Consenting Badults</p>
      </div>
      {!props.tiny ? (
        <>
          {" "}
          <div
            ref={skinCardRef as React.RefObject<HTMLDivElement>}
            id="skin-card-container"
            className="ingredients-container"
          >
            <PinkFlipPreload
              skinIsFlipped={skinIsFlipped}
              generateIngredients={generateIngredients}
              generateDescriptions={generateDescriptions}
            />
          </div>
          <div
            ref={hairCardRef as React.RefObject<HTMLDivElement>}
            className="ingredients-container"
            id="hair-card-container"
          >
            <GreenFlipPreload
              hairIsFlipped={hairIsFlipped}
              generateIngredients={generateIngredients}
              generateDescriptions={generateDescriptions}
            />
          </div>
        </>
      ) : (
        ""
      )}
      {!props.tiny ? (
        <div className="ingredients-container" id="twin-cards">
          <div
            id="twin-cards-inner"
            ref={twinCardRef as React.RefObject<HTMLDivElement>}
          >
            <ReactCardFlip
              isFlipped={skinSquareFlipped}
              flipDirection="vertical"
              containerStyle={{
                margin: "1rem",
                height: "88.89%",
                width: "50%",
              }}
            >
              <div
                className="twin-card main-img"
                id="skin-square"
                style={{
                  opacity: skinSquareFlipped
                    ? 0
                    : squareOpacityIndex === 2
                    ? 0.5
                    : 1,
                }}
                onMouseOver={(): void => {
                  setSquareOpacityIndex(1);
                }}
                onMouseLeave={(): void => {
                  setSquareOpacityIndex(0);
                }}
                onClick={(): void => {
                  goTo("/skincare");
                }}
              >
                <Text3D text="skin" squareOpacityIndex={squareOpacityIndex} />
              </div>
              <div></div>
            </ReactCardFlip>
            <ReactCardFlip
              isFlipped={hairSquareFlipped}
              flipDirection="vertical"
              containerStyle={{
                margin: "1rem",
                height: "88.89%",
                width: "50%",
              }}
            >
              <div
                className="twin-card main-img"
                id="hair-square"
                style={{
                  opacity: hairSquareFlipped
                    ? 0
                    : squareOpacityIndex === 1
                    ? 0.5
                    : 1,
                }}
                onMouseOver={(): void => {
                  setSquareOpacityIndex(2);
                }}
                onMouseLeave={(): void => {
                  setSquareOpacityIndex(0);
                }}
                onClick={(): void => {
                  goTo("/haircare");
                }}
              >
                <Text3D text="hair" squareOpacityIndex={squareOpacityIndex} />
              </div>
              <div></div>
            </ReactCardFlip>
          </div>
        </div>
      ) : (
        <>
          <div className="ingredients-container">
            <div className="single-card">
              <ReactCardFlip
                isFlipped={false}
                flipDirection="vertical"
                containerStyle={{
                  margin: "1rem",
                  height: "88.89%",
                  width: "50%",
                }}
              >
                <div
                  className="twin-card main-img"
                  id="skin-square"
                  style={{
                    opacity: 1,
                  }}
                  onMouseOver={(): void => {
                    setSquareOpacityIndex(1);
                  }}
                  onMouseLeave={(): void => {
                    setSquareOpacityIndex(0);
                  }}
                  onClick={(): void => {
                    goTo("/skincare");
                  }}
                >
                  <Text3D text="skin" squareOpacityIndex={squareOpacityIndex} />
                </div>
                <div></div>
              </ReactCardFlip>
            </div>
          </div>
          <div className="ingredients-container">
            <div className="single-card">
              <ReactCardFlip
                isFlipped={false}
                flipDirection="vertical"
                containerStyle={{
                  margin: "1rem",
                  height: "88.89%",
                  width: "50%",
                }}
              >
                <div
                  className="twin-card main-img"
                  id="hair-square"
                  style={{
                    opacity: 1,
                  }}
                  onMouseOver={(): void => {
                    setSquareOpacityIndex(2);
                  }}
                  onMouseLeave={(): void => {
                    setSquareOpacityIndex(0);
                  }}
                  onClick={(): void => {
                    goTo("/haircare");
                  }}
                >
                  <Text3D text="hair" squareOpacityIndex={squareOpacityIndex} />
                </div>
                <div></div>
              </ReactCardFlip>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default BonxMain;
