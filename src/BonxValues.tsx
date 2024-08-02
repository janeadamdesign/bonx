// Module imports
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Local imports
import { Animations, Value, IntersectionOptions } from "./BonxTypes";
import { values } from "./Values";

interface BonxValuesProps {
  framerAnimations: Animations;
  tiny: boolean;
}

function BonxValues(props: BonxValuesProps): React.ReactElement {
  // Dynamic margin logic
  const [titleMargin, setTitleMargin]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState(0);
  const [descriptionMargin, setDescriptionMargin]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState(0);
  //Landscape State logic
  const [landscape, setLandscape]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState(true);
  useEffect((): (() => void) => {
    const setLand = (): void => {
      if (window.innerWidth > window.innerHeight) {
        setLandscape(true);
      } else setLandscape(false);
    };
    setLand();
    window.addEventListener("resize", setLand);
    return (): void => {
      window.removeEventListener("resize", setLand);
    };
  }, []);

  useEffect(() => {
    const setMargins = (): void => {
      if (window.innerWidth < 1100) {
        const tm: number = (1 / window.innerWidth) * 1500;
        setTitleMargin(tm);
      } else setTitleMargin(0);
      const dm: number = (1 / window.innerWidth) * 6000;
      setDescriptionMargin(dm);
    };
    setMargins();
    window.addEventListener("resize", setMargins);
    return (): void => {
      window.removeEventListener("resize", setMargins);
    };
  }, []);

  /* Content Generation:
  - Colours stored as CSS string in object for later injection
  - Function to generate section divs & inject copy and image src
  */
  const colours: { [key: string]: string } = {
    1: "linear-gradient(to bottom, #49af67, #FF005B)",
    2: "linear-gradient(to bottom, #f696ac, #B096F6)",
    3: "linear-gradient(to bottom, #0093ff, #bfff8c)",
    4: "linear-gradient(to bottom, #ff5692, #ffe600)",
  };
  const generateValues = (): JSX.Element[] => {
    let content: JSX.Element[] = values.map(
      (value: Value, index: number): JSX.Element => {
        const colour: string = colours[index + 1];
        let imageRef: React.RefObject<HTMLImageElement | null> | null = null;
        let divRef: React.RefObject<HTMLDivElement | null> | null = null;
        switch (index) {
          case 0:
            imageRef = image1Ref;
            divRef = div1Ref;
            break;
          case 1:
            imageRef = image2Ref;
            divRef = div2Ref;
            break;
          case 2:
            imageRef = image3Ref;
            divRef = div3Ref;
            break;
          case 3:
            imageRef = image4Ref;
            divRef = div4Ref;
            break;
        }
        if (imageRef && divRef) {
          return (
            <React.Fragment key={index}>
              <div
                id={`value${(index + 1).toString()}`}
                className="value-container"
                style={{ background: colour }}
              >
                <div
                  className={
                    landscape
                      ? "value-image-container"
                      : "value-image-container-portrait"
                  }
                  ref={divRef as React.RefObject<HTMLDivElement>}
                  id={value?.src}
                >
                  <img
                    id={value?.src.slice(1, -4)}
                    alt={value?.src}
                    className="value-image"
                    src={value?.src}
                    ref={imageRef as React.RefObject<HTMLImageElement>}
                    style={
                      props.tiny
                        ? { clipPath: "inset(0 0 0 0)" }
                        : { clipPath: "inset(0 0 0 100%)" }
                    }
                  />
                </div>
                <div className="value-text-container">
                  <p
                    className="value-title"
                    style={{ marginTop: `${titleMargin}%` }}
                  >
                    {value?.content?.title}
                  </p>
                  <p
                    className="value-description"
                    style={{ marginTop: `${descriptionMargin}%` }}
                  >
                    {value?.content?.description}
                  </p>
                </div>
              </div>{" "}
              <div className="divider-container">
                {index === 3 ? "" : <p className="curly-divider">bonx</p>}
              </div>
            </React.Fragment>
          );
        } else return <p>refs not loaded</p>;
      }
    );
    return content;
  };

  /*  Logic for image animation:
  - Store images as refs
  - Store divs as refs
  - useEffect:
    - Intersection callback fn
    - Intersection options object
    - Observer creation
    - Observer destruction upon unmount */

  const image1Ref: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  const image2Ref: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  const image3Ref: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  const image4Ref: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  const div1Ref: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const div2Ref: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const div3Ref: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const div4Ref: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  useEffect((): (() => void) => {
    const imageIntersectionCallback = (
      entries: IntersectionObserverEntry[]
    ): void => {
      entries.forEach((entry: IntersectionObserverEntry): void => {
        if (
          !div1Ref.current ||
          !div2Ref.current ||
          !div3Ref.current ||
          !div4Ref.current ||
          !image1Ref.current ||
          !image2Ref.current ||
          !image3Ref.current ||
          !image4Ref.current
        )
          return;
        const origin: HTMLDivElement = entry.target as HTMLDivElement;
        let target: HTMLImageElement | null = null;
        switch (origin) {
          case div1Ref.current:
            target = image1Ref.current;
            break;
          case div2Ref.current:
            target = image2Ref.current;
            break;
          case div3Ref.current:
            target = image3Ref.current;
            break;
          case div4Ref.current:
            target = image4Ref.current;
            break;
        }
        if (entry.isIntersecting && target) {
          console.log(`${origin.id} has entered the chat`);
          target.style.clipPath = `inset(0 0 0 0)`;
        } else if (target) {
          console.log(`${origin.id} has left the chat`);
          // target.style.clipPath = `inset(0 0 0 100%)`;
        }
      });
    };
    const intersectionValueOptions: IntersectionOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.65, // Chrome behaviour fixed!
    };

    const valueObserver: IntersectionObserver = new IntersectionObserver(
      imageIntersectionCallback,
      intersectionValueOptions
    );
    if (
      div1Ref.current &&
      div2Ref.current &&
      div3Ref.current &&
      div4Ref.current
    ) {
      valueObserver.observe(div1Ref.current);
      valueObserver.observe(div2Ref.current);
      valueObserver.observe(div3Ref.current);
      valueObserver.observe(div4Ref.current);
      console.log(`observers observed`);
    }
    return (): void => {
      valueObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {" "}
      <div className="marquee">
        {" "}
        {props.tiny ? (
          <>
            <p className="shop-title-values">
              OUR <p>VALUES</p>
            </p>
          </>
        ) : window.innerWidth > 1000 ? (
          <p className="shop-title">OUR VALUES</p>
        ) : (
          <p className="shop-title">
            OUR <p>VALUES</p>
          </p>
        )}
      </div>
      {generateValues()}
    </motion.div>
  );
}

export default BonxValues;
