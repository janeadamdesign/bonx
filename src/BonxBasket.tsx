//Module imports
import React, { useRef, useEffect, useState } from "react";
import { useSpring, animated, SpringValues } from "react-spring";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavigateFunction } from "react-router-dom";
import emailjs from "@emailjs/browser";

//Local imports
import {
  BasketContents,
  Animations,
  skincareProducts,
  haircareProducts,
  Product,
  framerAnimations,
  GetAddressSuggestion,
  GetAddressSuggestionsObject,
  GetAddress,
  ManualAddress,
  ConfirmedAddress,
  BonxEmailData,
} from "./BonxTypes";
import StripeModule from "./StripeModule";

// Props interfaces for
interface BonxBasketProps {
  framerAnimations: Animations;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  tiny: boolean;
}
interface BasketMainProps {
  framerAnimations: Animations;
  basket: BasketContents;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  setBasketPage: React.Dispatch<React.SetStateAction<number>>;
  gigaTotal: number | null;
  setGigaTotal: React.Dispatch<React.SetStateAction<number | null>>;
  tiny: boolean;
}
interface CustomerDetailsProps {
  framerAnimations: Animations;
  setBasketPage: React.Dispatch<React.SetStateAction<number>>;
  confirmedAddress: ConfirmedAddress | null;
  setConfirmedAddress: React.Dispatch<
    React.SetStateAction<ConfirmedAddress | null>
  >;
  tiny: boolean;
}
interface PaymentWindowProps {
  framerAnimations: Animations;
  setBasketPage: React.Dispatch<React.SetStateAction<number>>;
  confirmedAddress: ConfirmedAddress | null;
  setConfirmedAddress: React.Dispatch<
    React.SetStateAction<ConfirmedAddress | null>
  >;
  gigaTotal: number | null;
  setGigaTotal: React.Dispatch<React.SetStateAction<number | null>>;
  setBasket: React.Dispatch<React.SetStateAction<BasketContents>>;
  basket: BasketContents;
  tiny: boolean;
}

/* Parent component. Contains logic for conditional rendering of named components [BasketMain, CustomerDetails, Payment Window] */
function BonxBasket(props: BonxBasketProps): React.ReactElement {
  // Total to be passed around
  const [gigaTotal, setGigaTotal]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);

  // Nav logic
  const [basketPage, setBasketPage]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);

  // Stateful confirmed address: reset upon any refresh
  const [confirmedAddress, setConfirmedAddress]: [
    ConfirmedAddress | null,
    React.Dispatch<React.SetStateAction<ConfirmedAddress | null>>
  ] = useState<ConfirmedAddress | null>(null);
  useEffect((): void => {
    setConfirmedAddress(null);
  }, []);

  // Spring animation settings
  const fadeInBasket: SpringValues<{ opacity: number }> = useSpring<{
    opacity: number;
  }>({
    to: { opacity: 1 },
    from: { opacity: 0 },
    reset: false,
    delay: 0,
    config: {
      tension: 170,
      friction: 26,
      mass: 1,
      duration: 250,
    },
  });

  // Window Navigation Element
  const windowNav = (): JSX.Element => {
    switch (basketPage) {
      default:
      case 0:
        return (
          <BasketMain
            basket={props.basket}
            framerAnimations={framerAnimations}
            setBasket={props.setBasket}
            setBasketPage={setBasketPage}
            gigaTotal={gigaTotal}
            setGigaTotal={setGigaTotal}
            tiny={props.tiny}
          />
        );
      case 1:
        return (
          <CustomerDetails
            framerAnimations={framerAnimations}
            setBasketPage={setBasketPage}
            confirmedAddress={confirmedAddress}
            setConfirmedAddress={setConfirmedAddress}
            tiny={props.tiny}
          />
        );
      case 2:
        return (
          <PaymentWindow
            framerAnimations={framerAnimations}
            setBasketPage={setBasketPage}
            confirmedAddress={confirmedAddress}
            setConfirmedAddress={setConfirmedAddress}
            gigaTotal={gigaTotal}
            setGigaTotal={setGigaTotal}
            setBasket={props.setBasket}
            basket={props.basket}
            tiny={props.tiny}
          />
        );
    }
  };

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
    >
      {" "}
      <div className="marquee">
        {" "}
        <p className={props.tiny ? "shop-title-tiny" : "shop-title"}>BASKET</p>
      </div>
      <animated.div
        style={fadeInBasket}
        id={props.tiny ? "basket-container-tiny" : "basket-container"}
      >
        <AnimatePresence mode="wait">{windowNav()}</AnimatePresence>
      </animated.div>
    </motion.div>
  );
}

// 1st Window: Basket Rendering Logic
function BasketMain(props: BasketMainProps): React.ReactElement {
  // Basket Logic
  const addition = (e: React.MouseEvent): void => {
    const targetButton: HTMLButtonElement =
      e.currentTarget as HTMLButtonElement;
    const targetParent: HTMLDivElement | null =
      targetButton.closest(".entry-container");
    const product: string = targetParent?.id.replace(
      "-container",
      ""
    ) as string;
    props.setBasket((prev: BasketContents): BasketContents => {
      return { ...prev, [product]: prev[product] ? prev[product] + 1 : 1 };
    });
  };
  const subtraction = (e: React.MouseEvent): void => {
    const targetButton: HTMLButtonElement =
      e.currentTarget as HTMLButtonElement;
    const targetParent: HTMLDivElement | null =
      targetButton.closest(".entry-container");
    const product: string = targetParent?.id.replace(
      "-container",
      ""
    ) as string;
    props.setBasket((prev: BasketContents): BasketContents => {
      return { ...prev, [product]: prev[product] ? prev[product] - 1 : 0 };
    });
  };
  useEffect((): void => {
    const newBasket: BasketContents = { ...props.basket };
    for (let key in newBasket) {
      if (newBasket[key] === 0) {
        delete newBasket[key];
      }
    }
    if (JSON.stringify(props.basket) !== JSON.stringify(newBasket)) {
      props.setBasket(newBasket);
    }
  }, [props.basket, props.setBasket]);

  // Get product link logic
  let navigate: NavigateFunction = useNavigate();
  const getLink = (e: React.MouseEvent): void => {
    if (e.currentTarget.closest(".entry-container")) {
      const element: HTMLDivElement = e.currentTarget.closest(
        ".entry-container"
      ) as HTMLDivElement;
      const productName: string = element?.id.replace("-container", "");
      if (
        skincareProducts.some(
          (product: Product): boolean => product.title === productName
        )
      ) {
        navigate("/skincare");
      } else {
        navigate("/haircare");
      }
    }
  };

  // Width calculator variable
  const [entryContainerWidth, setEntryContainerWidth]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState(75);

  useEffect((): (() => void) => {
    const calculateWidth = (): number => {
      let result: number = 0;
      if (!props.tiny) {
        result = 75;
      } else result = 100 - window.innerWidth / 60 + 5;
      console.log(result);
      setEntryContainerWidth(result);
      return result;
    };
    setEntryContainerWidth(calculateWidth);
    window.addEventListener("resize", calculateWidth);
    return (): void => {
      window.removeEventListener("resize", calculateWidth);
    };
  }, [props.tiny]);

  // Content Generation Logic
  const totalRef: React.MutableRefObject<number[] | null> = useRef<[]>(null);
  const expoundContents = (basket: BasketContents): JSX.Element[] => {
    totalRef.current = [];
    const keyArray: string[] = Object.keys(basket);
    return keyArray.map((key: string): JSX.Element => {
      const title: string = key;
      let src: string;
      let price: number = 0;
      let priceSource: Product[] = [];
      if (
        skincareProducts.some(
          (product: Product): boolean => product.title === title
        )
      ) {
        priceSource = skincareProducts;
      } else priceSource = haircareProducts;
      price = parseInt(
        priceSource
          .find((product: Product): boolean => product.title === title)
          ?.price.replace("€", "") as string
      );
      src = priceSource.find(
        (product: Product): boolean => product.title === title
      )?.src1 as string;
      if (totalRef.current) {
        totalRef.current.push(price * basket[key]);
      }

      return (
        <div
          className="entry-container"
          id={title + "-container"}
          key={title}
          style={{ width: `${entryContainerWidth}%` }}
        >
          <img
            className="basket-img"
            src={src}
            onClick={getLink}
            alt={title + "-image"}
          />
          <span
            className="basket-entry"
            style={
              props.tiny
                ? {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }
                : {
                    display: "grid",
                    gridTemplateColumns: "30% 20% 20% 20% 10%",
                  }
            }
          >
            <p className="item-title" onClick={getLink}>
              {title}
            </p>
            <p className="item-quantity">
              <em>qty</em>: {basket[key]}
            </p>
            <p className="item-price">€{price}</p>
            <p className="item-total">€{price * basket[key]}</p>
            <span className="plus-minus">
              <button className="pm-button" onClick={addition}>
                +
              </button>
              <button className="pm-button" onClick={subtraction}>
                -
              </button>
            </span>
          </span>
        </div>
      );
    });
  };
  const fillBasket = (basket: BasketContents): JSX.Element => {
    if (Object.keys(basket).length === 0) {
      return (
        <div id="empty-basket">
          <p className="curly">your basket is empty</p>
        </div>
      );
    } else
      return (
        <div id="basket-contents">
          <div className="basket-title">
            <p className="curly">your basket</p>
          </div>
          {expoundContents(props.basket)}{" "}
          <p id="shipping">shipping will always be free!</p>
          <div id="total-container">
            <p className="basket-totals">
              <em>total:</em>
            </p>
            <p className="basket-totals">€{props.gigaTotal}</p>
            <div>
              <button
                className="checkout-button"
                onClick={(): void => {
                  props.setBasketPage(1);
                }}
              >
                <p className="italic">checkout →</p>{" "}
              </button>
            </div>
          </div>
        </div>
      );
  };

  useEffect((): void => {
    if (!totalRef.current) return;
    props.setGigaTotal(
      totalRef.current?.reduce((acc: number, el: number): number => {
        return acc + el;
      }, 0)
    );
  }, [totalRef.current]);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
      className="basket-inner"
    >
      {fillBasket(props.basket)}
    </motion.div>
  );
}

// 2nd Window: Customer Details Logic
function CustomerDetails(props: CustomerDetailsProps): React.ReactElement {
  // Autocomplete Functionality
  // Address states with defaults
  const [addressSuggestions, setAddressSuggestions]: [
    GetAddressSuggestion[],
    React.Dispatch<React.SetStateAction<GetAddressSuggestion[]>>
  ] = useState<GetAddressSuggestion[]>([]);
  const [address, setAddress]: [
    GetAddress | null,
    React.Dispatch<React.SetStateAction<GetAddress | null>>
  ] = useState<GetAddress | null>(null);

  // address api lookup
  const getAddressApiKey: string = "B2-2N-4E6kaWd6Ntj4FZhw42827";
  const getAddresses = async (
    idOrPostcode: string,
    identifier: string
  ): Promise<{}> => {
    let link: string;
    if (identifier === "postcode") {
      const postcode: string = idOrPostcode;
      link = `https://api.getAddress.io/autocomplete/${postcode}?api-key=${getAddressApiKey}`;
    } else {
      const id: string = idOrPostcode;
      link = `https://api.getAddress.io/get/${id}?api-key=${getAddressApiKey}`;
    }
    try {
      const response: Response = await fetch(link);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let data: GetAddressSuggestionsObject | GetAddress;
      if (identifier === "postcode") {
        data = (await response.json()) as GetAddressSuggestionsObject;
        setAddressSuggestions(data.suggestions);
      } else {
        data = (await response.json()) as GetAddress;
        setAddress(data);
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      throw error;
    }
  };
  const autoComplete = (e: React.MouseEvent): void => {
    e.preventDefault();
    getAddresses(postcodeLookup, "postcode");
  };

  // Stateful form components
  const [manualAuto, setManualAuto]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("auto");
  const [postcodeLookup, setPostcodeLookup]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [name, setName]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [email, setEmail]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [manualAddress, setManualAddress]: [
    ManualAddress,
    React.Dispatch<React.SetStateAction<ManualAddress>>
  ] = useState<ManualAddress>({
    "line 1": "",
    "line 2": "",
    "town or city": "",
    county: "",
    country: "",
    postcode: "",
  });

  //Change handling for controlled form elements with user input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const id: string = e.target.id;
    switch (id) {
      case "manual-radio":
      case "auto-radio":
        setManualAuto(e.target.value);
        break;
      case "postcodeLookup":
        setPostcodeLookup(e.target.value);
        break;
      case "dropdown":
        setSelectedSuggestion(e.target.value);
        break;
      case "name":
        setName(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
    }
  };
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const id: string = e.target.id;
    switch (id) {
      case "line1":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, "line 1": e.target.value };
        });
        break;
      case "line2":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, "line 2": e.target.value };
        });
        break;
      case "town-or-city":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, "town or city": e.target.value };
        });
        break;
      case "county":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, county: e.target.value };
        });
        break;
      case "country":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, country: e.target.value };
        });
        break;
      case "postcode":
        setManualAddress((prev: ManualAddress): ManualAddress => {
          return { ...prev, postcode: e.target.value };
        });
        break;
    }
  };

  // Dynamic content generation
  const generateAddressDropdown = (
    getAddressSuggestion: GetAddressSuggestion[]
  ): JSX.Element[] => {
    const stringArray: string[] = getAddressSuggestion.map(
      (element: GetAddressSuggestion): string => element.address
    );
    const jsxArray: JSX.Element[] = stringArray.map(
      (string: string): JSX.Element => {
        return (
          <option value={string} key={string}>
            {string}
          </option>
        );
      }
    );
    return jsxArray;
  };
  const generateRelevant = (): Partial<GetAddress> => {
    const relevantValues: (keyof GetAddress)[] = [
      "line_1",
      "line_2",
      "line_3",
      "line_4",
      "locality",
      "town_or_city",
      "county",
      "district",
      "country",
      "postcode",
    ];
    const relevantObject: Partial<GetAddress> = relevantValues.reduce(
      (
        accumulator: Partial<GetAddress>,
        currentKey: keyof GetAddress
      ): Partial<GetAddress> => {
        if (address && currentKey in address && address[currentKey] !== "") {
          (accumulator as any)[currentKey] = address[currentKey];
        }
        return accumulator;
      },
      {} as Partial<GetAddress>
    );
    return relevantObject;
  };
  const generateAddressContent = (): JSX.Element => {
    const relevantObject: Partial<GetAddress> = generateRelevant();
    let content: JSX.Element[] = [];
    for (const key in relevantObject) {
      const typedKey: keyof GetAddress = key as keyof GetAddress;
      content.push(
        <span className="autocompleted" key={key}>
          <p className="form-input-label">{key.replace(/_/g, " ")}</p>
          <p className="item-total">{relevantObject[typedKey]}</p>
        </span>
      );
    }
    return <>{content}</>;
  };

  // Navigation clickers
  const backDirection = (e: React.MouseEvent): void => {
    e.preventDefault();
    props.setBasketPage(0);
  };
  const payment = (e: React.FormEvent<HTMLFormElement>): void => {
    if (!e.currentTarget.checkValidity()) return;
    e.preventDefault();
    switch (manualAuto) {
      case "manual":
        if (
          manualAddress["line 1"] === "" ||
          manualAddress["town or city"] === "" ||
          manualAddress.county === "" ||
          manualAddress.country === "" ||
          manualAddress.postcode === ""
        ) {
          alert("more address detail required");
          return;
        }
        props.setConfirmedAddress({
          name: name,
          email: email,
          address: manualAddress,
        });
        break;
      case "auto":
        const relevantObject: Partial<GetAddress> = generateRelevant();
        props.setConfirmedAddress({
          name: name,
          email: email,
          address: relevantObject,
        });
        break;
    }
  };
  useEffect((): void => {
    if (props.confirmedAddress) {
      props.setBasketPage(2);
    }
  }, [props.confirmedAddress]);

  // useEffect to retrieve full address from API when option selected
  useEffect((): void => {
    if (
      selectedSuggestion === "" ||
      selectedSuggestion === "44 Albacore Crescent, London, SE13 7HP"
    )
      return;
    const id: string | undefined = addressSuggestions.find(
      (element: GetAddressSuggestion): boolean =>
        element.address === selectedSuggestion
    )?.id;
    if (id) {
      getAddresses(id, "id");
    }
  }, [selectedSuggestion, addressSuggestions]);

  // Width logic
  const [formContainerWidth, setFormContainerWidth]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState(50);
  useEffect((): (() => void) => {
    const calculateWidth = (): number => {
      let result: number = 0;
      if (!props.tiny) {
        result = 50;
      } else result = 95;
      setFormContainerWidth(result);
      console.log(result);
      return result
    };
    setFormContainerWidth(calculateWidth);
    window.addEventListener("resize", calculateWidth);
    return (): void => {
      window.removeEventListener("resize", calculateWidth);
    };
  }, [props.tiny]);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
      className="basket-inner"
    >
      <p className="curly details-title">your details</p>
      <form
        id="customer-form"
        onSubmit={payment}
        style={{ width: `${formContainerWidth}%` }}
      >
        <span className="form-division">
          <label className="form-input-label" htmlFor="fullName">
            Full Name:
          </label>
          <input
            value={name}
            onChange={handleChange}
            className="form-input-box"
            type="text"
            id="name"
            name="name"
            required
          />
        </span>
        <span className="form-division">
          <label className="form-input-label" htmlFor="email">
            Email Address:
          </label>
          <input
            value={email}
            className="form-input-box"
            onChange={handleChange}
            type="email"
            id="email"
            name="email"
            required
          />{" "}
        </span>
        <span id="radio-division">
          <label className="form-input-label radio">
            manual entry{" "}
            <input
              id="manual-radio"
              type="radio"
              name="option"
              value="manual"
              checked={manualAuto === "manual"}
              onChange={handleChange}
            />
          </label>
          <label className="form-input-label radio">
            <input
              id="auto-radio"
              type="radio"
              name="option"
              value="auto"
              checked={manualAuto === "auto"}
              onChange={handleChange}
            />
            &nbsp;fill address{" "}
          </label>
        </span>

        {manualAuto === "auto" ? (
          <>
            <span className="form-division">
              <input
                type="text"
                id="postcodeLookup"
                name="postcodeLookup"
                placeholder="enter postcode"
                value={postcodeLookup}
                onChange={handleChange}
                className="form-input-box"
              />
              <button className="checkout-button" onClick={autoComplete}>
                <p className="italic">lookup ↓</p>
              </button>
            </span>
            <select
              className="dropdown"
              id="dropdown"
              value={selectedSuggestion}
              onChange={handleChange}
            >
              {generateAddressDropdown(addressSuggestions)}
            </select>
            <div id="autocomplete-container">{generateAddressContent()}</div>
          </>
        ) : (
          <div className="manual-container">
            <span className="form-division">
              <label className="form-input-label" htmlFor="line1">
                line 1:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress["line 1"]}
                className="form-input-box"
                type="text"
                id="line1"
                name="line1"
              ></input>
            </span>
            <span className="form-division">
              <label className="form-input-label" htmlFor="line2">
                line 2:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress["line 2"]}
                className="form-input-box"
                type="text"
                id="line2"
                name="line2"
              ></input>
            </span>
            <span className="form-division">
              <label className="form-input-label" htmlFor="town-or-city">
                town or city:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress["town or city"]}
                className="form-input-box"
                type="text"
                id="town-or-city"
                name="town-or-city"
              ></input>
            </span>
            <span className="form-division">
              <label className="form-input-label" htmlFor="county">
                county:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress.county}
                className="form-input-box"
                type="text"
                id="county"
                name="county"
              ></input>
            </span>
            <span className="form-division">
              <label className="form-input-label" htmlFor="county">
                country:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress.country}
                className="form-input-box"
                type="text"
                id="country"
                name="country"
              ></input>
            </span>
            <span className="form-division">
              <label className="form-input-label" htmlFor="postcode">
                postcode:
              </label>
              <input
                onChange={handleManualChange}
                value={manualAddress.postcode}
                className="form-input-box"
                type="text"
                id="postcode"
                name="postcode"
              ></input>
            </span>
          </div>
        )}
        <span className="form-division">
          <button className="checkout-button" onClick={backDirection}>
            <p className="italic">← back</p>{" "}
          </button>
          <button className="checkout-button" type="submit">
            <p className="italic">payment →</p>{" "}
          </button>
        </span>
      </form>
    </motion.div>
  );
}

// 3rd Window: Taking Payment & Order Confirmation
function PaymentWindow(props: PaymentWindowProps): React.ReactElement {
  // useEffect to return us to previous page if there is no confirmed address
  useEffect((): void => {
    if (!props.confirmedAddress) {
      props.setBasketPage(1);
    }
  }, [props.confirmedAddress]);

  // Generate random order number each time
  const [orderNumber, setOrderNumber]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  useEffect((): void => {
    setOrderNumber(Math.floor(1000 + Math.random() * 9000));
  }, []);

  // State, Function & useEffect to establish whether we are dealing with a generated or manually entered address
  const [manualAddressToggle, setManualAddressToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const isManualAddress = (
    address: ManualAddress | Partial<GetAddress>
  ): address is ManualAddress => {
    return "line1" in address && "city" in address;
  };
  useEffect((): void => {
    if (!props.confirmedAddress) return;
    if (isManualAddress(props.confirmedAddress.address)) {
      setManualAddressToggle(true);
    } else setManualAddressToggle(false);
  }, [props.confirmedAddress]);

  // Logic to generate the content of the confirmed address fields
  const generateConfirmedAddress = (
    address: ManualAddress | Partial<GetAddress>
  ): JSX.Element[] => {
    let content: JSX.Element[] = [];
    const span = (
      key: keyof GetAddress | keyof ManualAddress,
      address: ManualAddress | Partial<GetAddress>,
      value: string
    ): JSX.Element => {
      return (
        <span className="autocompleted" key={key}>
          <p className="item-total">{value}</p>
        </span>
      );
    };
    if (manualAddressToggle) {
      const manualAddressObject: ManualAddress = {
        ...address,
      } as ManualAddress;
      for (const key in manualAddressObject) {
        const typedKey: keyof ManualAddress = key as keyof ManualAddress;
        const value: string = manualAddressObject[typedKey];
        content.push(
          span(key as keyof ManualAddress, manualAddressObject, value)
        );
      }
    } else {
      const getAddressObject: Partial<GetAddress> = {
        ...address,
      } as Partial<GetAddress>;
      for (const key in getAddressObject) {
        const typedKey: keyof GetAddress = key as keyof GetAddress;
        const value: string = getAddressObject[typedKey] as string;
        content.push(span(key as keyof GetAddress, getAddressObject, value));
      }
    }
    return content;
  };

  /* Logic for:
  - Submit button passed to Stripe module
  - Payment state: state setter passed to Stripe module 
  - Confirmation Window state: set by useEffect upon payment state change */
  const [submitFormTrigger, setSubmitFormTrigger]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const [paymentState, setPaymentState]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("pending");
  const [confirmationWindow, setConfirmationWindow]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): (() => void) => {
    const confirmationTimeout: NodeJS.Timeout | number = setTimeout(
      (): void => {
        if (paymentState === "success!") {
          setConfirmationWindow(true);
        }
      },
      500
    );
    return (): void => clearTimeout(confirmationTimeout);
  }, [paymentState]);

  // Logic to make API request to emailJS once payment complete/successful
  const emailTemplateId: string = "template_ajo124r";
  const emailServiceId: string = "service_7bxq76a";
  const emailPublicKey: string = "7Pnv_rg3SCrYBFp1S";
  useEffect((): void => {
    if (confirmationWindow === true) {
      if (props.confirmedAddress && orderNumber && props.basket) {
        const basketString: string = JSON.stringify(props.basket);
        // alert(basketString);
        const bonxEmailData: BonxEmailData = {
          customerName: props.confirmedAddress.name,
          customerEmail: props.confirmedAddress.email,
          orderNumber: orderNumber.toString(),
          orderDetails: basketString,
        };
        emailjs
          .send(emailServiceId, emailTemplateId, bonxEmailData, {
            publicKey: emailPublicKey,
          })
          .then(
            (): void => {
              alert("Confirmation Email Sent!");
            },
            (error: any): void => {
              alert(`Confirmation Email Failure ${error}`);
            }
          );
      }
      props.setBasket({});
    }
  }, [confirmationWindow, orderNumber]);

  return (
    <motion.div
      initial={props.framerAnimations.initial}
      animate={props.framerAnimations.animate}
      className="basket-inner"
    >
      <div id="payment-window">
        <p className="curly details-title">payment</p>
        <div id="payment-window-inner" style={props.tiny ? {flexDirection: "column"} : {
          flexDirection: "row"
        }}>
          <div className="manual-container">
            <p className="item-total">Order #{orderNumber}</p>
            <p className="item-total">{props.confirmedAddress?.name}</p>
            <p className="item-total">{props.confirmedAddress?.email}</p>
            {props.confirmedAddress
              ? generateConfirmedAddress(props.confirmedAddress.address)
              : ""}{" "}
          </div>

          <AnimatePresence mode="wait">
            {!confirmationWindow ? (
              <motion.div
                id="payment-container"
                initial={props.framerAnimations.initial}
                animate={props.framerAnimations.animate}
              >
                <div id="payment-container-inner" style={props.tiny ? {paddingLeft: "0"} : {paddingLeft: "2rem"}}>
                  <span id="payment-due">
                    <p className="item-total">checkout total:</p>
                    <p className="item-total">€{props.gigaTotal}</p>
                    <p className="item-total">
                      status: <em>{paymentState}</em>
                    </p>
                  </span>

                  <StripeModule
                    gigaTotal={props.gigaTotal}
                    setGigaTotal={props.setGigaTotal}
                    submitFormTrigger={submitFormTrigger}
                    setSubmitFormTrigger={setSubmitFormTrigger}
                    setPaymentState={setPaymentState}
                  />
                  <p className="hint">
                    stripe pay hint:{" "}
                    <em>
                      try 4000 0000 0000 3220 with any CVC & future expiry date{" "}
                    </em>{" "}
                    🙂
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                id="payment-container"
                initial={props.framerAnimations.initial}
                animate={props.framerAnimations.animate}
              >
                <div className="basket-title">
                  <p className="curly">order confirmed</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!confirmationWindow ? (
          <span className="form-division" id="final-checkout-buttons" style={props.tiny ? {width: "100%"}: {width: "50%"}}>
            <button
              className="checkout-button"
              onClick={(): void => props.setConfirmedAddress(null)}
            >
              <p className="italic">← back</p>{" "}
            </button>
            <button
              type="button"
              id="final-checkout"
              className="checkout-button"
              onClick={(): void => {
                setSubmitFormTrigger((prev: number): number => prev + 1);
              }}
            >
              <p className="italic">confirm checkout →</p>{" "}
            </button>
          </span>
        ) : (
          ""
        )}
      </div>
    </motion.div>
  );
}

export default BonxBasket;
