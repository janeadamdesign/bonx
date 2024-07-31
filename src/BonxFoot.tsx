// Package Imports
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import validator from "validator";

// Local imports
import { framerAnimations } from "./BonxTypes";

interface BonxFootProps {
  colour: string;
}
interface SignUpProps {
  setFooterTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignUp(props: SignUpProps): React.ReactElement {
  const [emailValue, setEmailValue]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [wobbleToggle, setWobbleToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmailValue(e.target.value);
  };
  const [triggerState, setTriggerState]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const emailInput: React.RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement | null>(null);

  // Wobble Email Logic
  const wobbleTimerRef: React.MutableRefObject<NodeJS.Timeout | number> =
    useRef(0);
  useEffect((): void | (() => void) => {
    if (triggerState === 0) return;
    if (!validator.isEmail(emailValue)) {
      setWobbleToggle(true);
      wobbleTimerRef.current = setTimeout((): void => {
        setWobbleToggle(false);
        if (emailInput.current) {
          emailInput.current.focus();
        }
      }, 500);
    } else {
      props.setFooterTrigger(true);
    }
    return (): void => clearTimeout(wobbleTimerRef.current);
  }, [triggerState, emailValue, props.setFooterTrigger]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === 'Return'){
      e.preventDefault();
      setTriggerState((prev: number): number => prev + 1);
    }
  }


  return (
    <motion.div
      initial={framerAnimations.initial}
      animate={framerAnimations.animate}
    >
      <span id="sign-up-container">
        <input
          ref={emailInput as React.RefObject<HTMLInputElement>}
          type="email"
          id="email-newsletter"
          className={wobbleToggle ? "email-wobble" : ""}
          onChange={handleEmailChange}
          value={emailValue}
          required
          onKeyDown={handleKeyPress}
        />
        <button
          id="subscribe"
          onClick={(): void => {
            setTriggerState((prev: number): number => prev + 1);
          }}
        >
          <p>SIGN UP</p>
        </button>
      </span>
    </motion.div>
  );
}

function DiscountCode(): React.ReactElement {
  const [backgroundOpacityToggle, setBackgroundOpacityToggle]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);

  useEffect((): (() => void) => {
    const toggleTimer: NodeJS.Timeout | number = setTimeout((): void => {
      setBackgroundOpacityToggle((prev: number): number => {
        switch (prev) {
          case 0:
            return 1;
          case 1:
            return 2;
          case 2:
            return 0;
          default:
            return 0;
        }
      });
    }, 750);
    return (): void => {
      clearTimeout(toggleTimer);
    };
  }, [backgroundOpacityToggle]);

  return (
    <motion.div
      initial={framerAnimations.initial}
      animate={framerAnimations.animate}
    >
      <div id="promo-code">
        <div
          id="promo-code-2"
          className="background-container"
          style={{ opacity: backgroundOpacityToggle === 1 ? 1 : 0 }}
        ></div>
        <div
          id="promo-code-3"
          className="background-container"
          style={{ opacity: backgroundOpacityToggle === 2 ? 1 : 0 }}
        ></div>
        <p id="discount-code-text">
          <span className="emoji">✨🛍️</span> 20BONX4U{" "}
          <span className="emoji">🔔✨</span>
        </p>
      </div>
    </motion.div>
  );
}

function BonxFoot(props: BonxFootProps): React.ReactElement {
  const [footerTrigger, setFooterTrigger]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);

  return (
    <footer id="bonx-foot" className={props.colour}>
      <div id="footer-text">
        <p>WANT 20% OFF YOUR FIRST ORDER?</p>
        <p>Subscribe to our newsletter to join Club Bonx!</p>
        <div id="footer-animation-container">
          <AnimatePresence mode="wait">
            {footerTrigger ? (
              <DiscountCode />
            ) : (
              <SignUp setFooterTrigger={setFooterTrigger} />
            )}
          </AnimatePresence>
        </div>
        <p id="trademark">©2024 BONX SKINCARE</p>
      </div>
    </footer>
  );
}

export default BonxFoot;
