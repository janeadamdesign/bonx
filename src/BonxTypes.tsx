// These are just going in here for ease of access

export const framerAnimations: Animations = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
};

export const skincareProducts: Product[] = [
  { title: "B-Serum", src1: "/serum2.png", src2: "/serum1.png", price: "€75" },
  { title: "B-Emol", src1: "/pot2.png", src2: "/pot1.png", price: "€65" },
  { title: "B-Cleanse", src1: "/kurt3.png", src2: "/kurt1.png", price: "€40" },
  { title: "B-Acid", src1: "/acid2.png", src2: "/acid3.png", price: "€55" },
];

export const haircareProducts: Product[] = [
  { title: "B-Pü", src1: "/champu2.png", src2: "/champu1.png", price: "€30" },
  {
    title: "B-Coal",
    src1: "/charcoal2.png",
    src2: "/charcoal1.png",
    price: "€35",
  },
  {
    title: "B-Marble",
    src1: "/marble2.png",
    src2: "/marble1.png",
    price: "€50",
  },
  { title: "B-Dry", src1: "/dryer1.png", src2: "/dryer2.png", price: "€150" },
];

// Class definitions

export interface Animations {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
}

export interface BasketContents {
  [key: string]: number;
}

export interface BonxEmailData extends Record<string, unknown> {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDetails: string;
}

export interface ClipPath {
  clipPath: string;
}

export interface ClipSpring {
  clipPath: string;
}

export interface ConfirmedAddress {
  name: string;
  email: string;
  address: ManualAddress | Partial<GetAddress>;
}

export interface GetAddress {
  postcode: string;
  latitude: number;
  longitude: number;
  formatted_address: string[];
  thoroughfare: string;
  building_name: string;
  sub_building_name: string;
  sub_building_number: string;
  building_number: string;
  line_1: string;
  line_2: string;
  line_3: string;
  line_4: string;
  locality: string;
  town_or_city: string;
  county: string;
  district: string;
  country: string;
  residential: boolean;
}

export interface GetAddressSuggestion {
  address: string;
  url: string;
  id: string;
}
export interface GetAddressSuggestionsObject {
  suggestions: GetAddressSuggestion[];
}

export interface IngredientMatrix {
  [key: string]: string;
}

export interface IntersectionOptions {
  root: null;
  rootMargin: string;
  threshold: number;
}

export interface LogoStyle {
  clipPath: string;
  transform: string;
}

export interface LogoSwitch {
  src: string;
}

export interface ManualAddress {
  "line 1": string;
  "line 2": string;
  "town or city": string;
  county: string;
  country: string;
  postcode: string;
}

export interface OpacitySpring {
  clipPath: string;
  opacity: number;
}

export interface Product {
  title: string;
  src1: string;
  src2: string;
  price: string;
}

export interface ProductMatrix {
  title: string;
  description: string;
  ingredients: string[];
}

export interface Value {
  name: string;
  src: string;
  content: {
    title: string;
    description: string;
  };
}
