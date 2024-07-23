// Package imports
import React, { useState, useEffect } from "react";
// Local imports
import "./Helices.scss";

interface Text3DProps {
  text: string;
  squareOpacityIndex: number;
}

function Text3D(props: Text3DProps): React.ReactElement {
  const panels: React.ReactNode[] = [];
  const generateHelices = (count: number, text: string): React.ReactNode[] => {
    for (let i: number = 0; i < count; i++) {
      switch (text) {
        case "skin":
          panels.push(<div className="panel skin" key={`skin-${i}`} />);
          break;
        case "hair":
          panels.push(<div className="panel hair" key={`hair-${i}`} />);
          break;
      }
    }
    return panels;
  };

  const [opacity, setOpacity]: [number, React.Dispatch<React.SetStateAction<number>>] = useState<number>(1);
  useEffect((): void => {
    if (
      (props.text === "skin" && props.squareOpacityIndex === 2) ||
      (props.text === "hair" && props.squareOpacityIndex === 1)
    ) {
      setOpacity(0);
    } else setOpacity(1);
  }, [props.text, props.squareOpacityIndex]);

  return (
    <div className="overflock" style={{ opacity: opacity }}>
      <div
        className={
          props.text === "hair" ? "panel-container-hair" : "panel-container"
        }
      >
        {generateHelices(40, props.text)}
      </div>
    </div>
  );
}

export default Text3D;
