// Module imports
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Local imports
import {
  BasketContents,
  Product,
  IntersectionOptions,
  Animations,
  ProductMatrix,
} from "./BonxTypes";
import { skinProductMatrix, hairProductMatrix } from "./Products";

interface ProductProps {
  identifier: string;
  products: Product[];
  framerAnimations: Animations;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  tiny: boolean;
}
interface IndividualProductProps {
  framerAnimations: Animations;
  setProductPage: React.Dispatch<React.SetStateAction<string>>;
  productPage: string;
  setProductRender: React.Dispatch<React.SetStateAction<string>>;
  products: Product[];
  identifier: string;
  addToBasket: (e: React.MouseEvent) => void;
  tiny: boolean;
}

function ProductContainer(props: ProductProps): React.ReactElement {
  // Logic related to content generation on the basis of props
  const products: Product[] = props.products;
  const generateProducts = (products: Product[]): JSX.Element[] | void => {
    if (products.length !== 4) return;
    let productsSynthesised: Product[][] = [];
    if (!props.tiny) {
      const firstProductArray: Product[] = products.slice(0, 2);
      const secondProductArray: Product[] = products.slice(2, 4);
      productsSynthesised = [[...firstProductArray], [...secondProductArray]];
    } else if (props.tiny) {
      const firstProductArray: Product[] = products.slice(0, 1);
      const secondProductArray: Product[] = products.slice(1, 2);
      const thirdProductArray: Product[] = products.slice(2, 3);
      const fourthProductArray: Product[] = products.slice(3, 4);
      productsSynthesised = [
        [...firstProductArray],
        [...secondProductArray],
        [...thirdProductArray],
        [...fourthProductArray],
      ];
    }
    const productOutput = (productArray: Product[]): JSX.Element[] => {
      return productArray.map((product: Product): JSX.Element => {
        return (
          <div
            className={props.tiny ? "product-tiny" : "product"}
            id={product.title}
            key={product.title}
          >
            <div className="product-img-container" onClick={productSetter}>
              <img
                className="product-img"
                src={product.src1}
                alt={product.title + "image1"}
              />
              <img
                className="product-img"
                src={product.src2}
                alt={product.title + "image2"}
              />
            </div>
            <div className="product-details">
              <div className="title-container" onClick={productSetter}>
                <p className="product-title">{product.title}</p>
                <p className="chevron">↗</p>
              </div>
              <button
                className="add-button"
                id={`add-${product.title}`}
                onClick={addToBasket}
              >
                <span className="add-container">
                  <p className="price">{product.price}</p>
                  <p className="italic">add to basket</p>
                </span>
              </button>
            </div>
          </div>
        );
      });
    };
    const combinedOutput = (synthesisedArray: Product[][]): JSX.Element[] => {
      return synthesisedArray.map(
        (productArray: Product[], index: number): JSX.Element => {
          return (
            <div className="product-container" key={index}>
              {props.tiny ? (
                <div className="product-inner-tiny">
                  {productOutput(productArray)}
                </div>
              ) : (
                <div
                  className="product-inner"
                  id={`${props.identifier}${index}`}
                  ref={
                    index === 0
                      ? (firstRef as React.RefObject<HTMLDivElement>)
                      : (secondRef as React.RefObject<HTMLDivElement>)
                  }
                >
                  {productOutput(productArray)}
                </div>
              )}
            </div>
          );
        }
      );
    };
    return combinedOutput(productsSynthesised);
  };

  // Add to basket function (passed as props to individual product)
  const addToBasket = (e: React.MouseEvent): void => {
    const id: string = e.currentTarget.id;
    const productId: string = id.replace("add-", "").replace("expanded-", "");
    if (!(productId in props.basket)) {
      props.setBasket((prev: BasketContents): BasketContents => {
        return { ...prev, [productId]: 1 };
      });
    } else {
      props.setBasket((prev: BasketContents): BasketContents => {
        const previousValue: number = prev[productId];
        return { ...prev, [productId]: previousValue + 1 };
      });
    }
  };

  // Intersection observer logic
  // DOM Refs
  const firstRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const secondRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  // Options, TimerRef & Intersection CB Fn
  const productIntersectionOptions: IntersectionOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };
  const panelTimerRef: React.MutableRefObject<NodeJS.Timeout | number | null> =
    useRef<NodeJS.Timeout | number | null>(null);
  const productIntersectionCBFunction = (
    entries: IntersectionObserverEntry[]
  ): void => {
    entries.forEach((entry: IntersectionObserverEntry): void => {
      const target: HTMLDivElement = entry.target as HTMLDivElement;
      if (entry.isIntersecting) {
        if (target.id === "skin1" || target.id === "hairprod1") {
          target.style.opacity = "1";
          target.style.transform = `translateX(0)`;
        } else if (target.id === "skin0" || target.id === "hairprod0") {
          panelTimerRef.current = setTimeout((): void => {
            target.style.opacity = "1";
            target.style.transform = `translateX(0)`;
          }, 200);
        }
      } else {
        target.style.opacity = "0";
        target.style.transform = `translateX(-50%)`;
      }
    });
  };

  //Logic relating to product expansion

  const [productPage, setProductPage]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("none");
  const [productRender, setProductRender]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("none");

  const productSetter = (e: React.MouseEvent): void => {
    let productId: string = "none";
    if (!props.tiny && e.currentTarget.closest(".product")) {
      productId = e.currentTarget.closest(".product")?.id as string;
    } else if (props.tiny && e.currentTarget.closest(".product-tiny")) {
      productId = e.currentTarget.closest(".product-tiny")?.id as string;
    }
    console.log(productId);
    if (productId === productPage) return;
    else setProductPage(productId);
  };

  //UseEffect: combines logic for inner page rendering and outer page observers
  useEffect((): void | (() => void) => {
    if (productPage !== "none") {
      if (!props.tiny) {
        if (firstRef.current && secondRef.current) {
          firstRef.current.style.opacity = "0";
          firstRef.current.style.transform = `translateX(-50%)`;
          secondRef.current.style.opacity = "0";
          secondRef.current.style.transform = `translateX(-50%)`;
          const pixelDistance: number =
            15 *
            parseFloat(getComputedStyle(document.documentElement).fontSize);
          window.scrollTo({
            top: pixelDistance,
            behavior: "smooth",
          });
        }
      }

      const renderTimer: NodeJS.Timeout | number = setTimeout((): void => {
        setProductRender(productPage);
      }, 500);
      return (): void => clearTimeout(renderTimer);
    } else {
      const observer: IntersectionObserver = new IntersectionObserver(
        productIntersectionCBFunction,
        productIntersectionOptions
      );
      if (firstRef.current && secondRef.current) {
        observer.observe(firstRef.current);
        observer.observe(secondRef.current);
      }
      return (): void => {
        if (panelTimerRef.current) {
          clearTimeout(panelTimerRef.current);
        }
        observer.disconnect();
      };
    }
  }, [productPage, productRender, props.tiny]);

  return (
    <AnimatePresence mode="wait">
      {productRender === "none" ? (
        <>{generateProducts(products)}</>
      ) : (
        <IndividualProduct
          products={props.products}
          framerAnimations={props.framerAnimations}
          setProductPage={setProductPage}
          productPage={productPage}
          setProductRender={setProductRender}
          identifier={props.identifier}
          addToBasket={addToBasket}
          tiny={props.tiny}
        />
      )}
    </AnimatePresence>
  );
}

function IndividualProduct(props: IndividualProductProps): React.ReactElement {
  // Gathering variables for content generation
  const title: string = props.productPage;
  const findSrcs = (products: Product[]): string[] => {
    return [
      products.find((product: Product): boolean => product.title === title)
        ?.src1 as string,
      products.find((product: Product): boolean => product.title === title)
        ?.src2 as string,
    ];
  };
  const productSrcs: string[] = findSrcs(props.products);
  const matrix: ProductMatrix[] =
    props.identifier === "skin" ? skinProductMatrix : hairProductMatrix;
  const description: string = matrix.find(
    (product: ProductMatrix): boolean => product.title === title
  )?.description as string;
  const ingredients: string[] = matrix.find(
    (product: ProductMatrix): boolean => product.title === title
  )?.ingredients as string[];
  const generateProductIngredients = (
    ingredientsArg: string[]
  ): JSX.Element[] => {
    return ingredientsArg.map((ingredient: string): JSX.Element => {
      return (
        <p className="ingredient-copy" key={ingredient}>
          → {ingredient}
        </p>
      );
    });
  };

  // Ascertain price
  const price: string = props.products.find(
    (product: Product): boolean => product.title === title
  )?.price as string;

  // Logic for image shifting
  const imageCount: React.MutableRefObject<number> = useRef<number>(0);
  const firstImageRef: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  const secondImageRef: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement | null>(null);
  useEffect((): (() => void) => {
    const imageInterval: NodeJS.Timeout | number = setInterval((): void => {
      if (!firstImageRef.current || !secondImageRef.current) return;
      if (imageCount.current % 2 === 0) {
        firstImageRef.current.style.opacity = "1";
        secondImageRef.current.style.opacity = "0";
      } else {
        firstImageRef.current.style.opacity = "0";
        secondImageRef.current.style.opacity = "1";
      }
      imageCount.current += 1;
      console.log(imageCount.current);
    }, 3000);

    return (): void => {
      imageCount.current = 0;
      clearInterval(imageInterval);
    };
  }, []);

  // useEffect to return us to main product display
  useEffect((): void => {
    if (props.productPage === "none") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
      props.setProductRender(props.productPage);
    }
  }, [props.productPage]);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {!props.tiny ? (
        <div className="product-container">
          {" "}
          <div className="product-expanded-inner">
            <div className="product-expanded">
              <div className="product-expanded-img-container">
                <img
                  alt={title + "product-img-1"}
                  className="product-img"
                  src={productSrcs[0]}
                  ref={firstImageRef as React.RefObject<HTMLImageElement>}
                />
                <img
                  alt={title + "product-img-2"}
                  className="product-img"
                  src={productSrcs[1]}
                  ref={secondImageRef as React.RefObject<HTMLImageElement>}
                />
              </div>
              <div className="product-expanded-details">
                <p className="product-title">{title}</p>
                <div className="description-container">
                  <p className="description-copy">{description}</p>
                </div>
                {ingredients ? (
                  ingredients.length > 0 ? (
                    <div className="ingredients-container">
                      <p className="ingredient-title">ACTIVES</p>
                      {ingredients
                        ? generateProductIngredients(ingredients)
                        : ""}
                    </div>
                  ) : (
                    ""
                  )
                ) : (
                  ""
                )}
                <div className="button-container">
                  <button
                    className="add-button"
                    id={`expanded-add-${title}`}
                    onClick={props.addToBasket}
                  >
                    <span className="add-container">
                      <p className="price">{price}</p>
                      <p className="italic">add to basket</p>
                    </span>
                  </button>
                  <button
                    className="product-return-button"
                    onClick={(): void => {
                      props.setProductPage("none");
                    }}
                  >
                    <p className="italic">← RETURN</p>{" "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="product-container-tiny">
          <div className="product-img-container-tiny">
            <img
              alt={title + "product-img-1"}
              className="product-img-tiny"
              src={productSrcs[0]}
              ref={firstImageRef as React.RefObject<HTMLImageElement>}
            />
          </div>
          <div className="product-expanded-details-tiny">
            <div className="ptt-container">
              {" "}
              <p className="product-title ptt">{title}</p>
            </div>
            <div className="description-container">
              <p className="description-copy">{description}</p>
            </div>
            {ingredients ? (
              ingredients.length > 0 ? (
                <div className="ingredients-container">
                  <p className="ingredient-title">ACTIVES</p>
                  {ingredients ? generateProductIngredients(ingredients) : ""}
                </div>
              ) : (
                ""
              )
            ) : (
              ""
            )}
            <div className="button-container">
              <button
                className="add-button"
                id={`expanded-add-${title}`}
                onClick={props.addToBasket}
              >
                <span className="add-container">
                  <p className="price">{price}</p>
                  <p className="italic">add to basket</p>
                </span>
              </button>
              <button
                className="product-return-button"
                onClick={(): void => {
                  props.setProductPage("none");
                }}
              >
                <p className="italic">← RETURN</p>{" "}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ProductContainer;
