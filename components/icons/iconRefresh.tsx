"use client";

import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
interface IProps {
  size?: string;
  color?: string;
  onClick?: () => any;
}
export default function IconRefresh({
  size = "2xl",
  color = "#000",
  onClick,
}: IProps) {
  const [animate, setAnimate] = useState(false);
  return (
    <FontAwesomeIcon
    className={`${animate && "animate-wiggle"}`}
      icon={faRotate}
      size={size as any}
      color={color}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);
        if (onClick) onClick();
      }}
    />
  );
}
