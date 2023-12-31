"use client";
import React, { useState } from "react";

interface IProps {
  active?: boolean;
  size?: string;
  color?: string;
  onClick?: (newValue: any) => any;
}
export default function IconWatch({
  active = true,
  size = "24px",
  color = "#000",
  onClick = () => {},
}: IProps) {
  // const [active, setActive] = useState(true);
  // onClick = () => setActive(!active)
  if (active) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        style={{
          cursor: "pointer",
        }}
      >
        <g clipPath="url(#clip0_2_28)">
          <path
            d="M95 46.5C97.7614 46.5 100.038 44.2487 99.6206 41.519C98.2584 32.6138 93.2709 24.2738 85.3553 17.8622C75.9785 10.267 63.2608 6 50 6C36.7392 6 24.0215 10.267 14.6447 17.8622C6.72908 24.2738 1.74161 32.6138 0.379396 41.519C-0.0381584 44.2487 2.23858 46.5 5 46.5L25 46.5C27.7614 46.5 29.9262 44.1891 30.9303 41.6167C31.8892 39.16 33.5669 36.9005 35.8579 35.0449C39.6086 32.0068 44.6957 30.3 50 30.3C55.3043 30.3 60.3914 32.0068 64.1421 35.0449C66.4331 36.9005 68.1108 39.16 69.0697 41.6167C70.0738 44.1891 72.2386 46.5 75 46.5H95Z"
            fill={color}
          />
          <path
            d="M5 53.5C2.23857 53.5 -0.0381648 55.7513 0.379389 58.481C1.7416 67.3862 6.72907 75.7262 14.6447 82.1378C24.0215 89.733 36.7392 94 50 94C63.2608 94 75.9785 89.733 85.3553 82.1378C93.2709 75.7262 98.2584 67.3862 99.6206 58.481C100.038 55.7513 97.7614 53.5 95 53.5L75 53.5C72.2386 53.5 70.0738 55.8109 69.0697 58.3833C68.1108 60.84 66.4331 63.0995 64.1421 64.9551C60.3914 67.9932 55.3043 69.7 50 69.7C44.6957 69.7 39.6086 67.9932 35.8579 64.9551C33.5669 63.0995 31.8892 60.84 30.9302 58.3833C29.9262 55.8109 27.7614 53.5 25 53.5L5 53.5Z"
            fill={color}
          />
          <circle cx="50" cy="50" r="9" fill={color} />
        </g>
        <defs>
          <clipPath id="clip0_2_28">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  } else {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        style={{
          cursor: "pointer",
        }}
      >
        <g clipPath="url(#clip0_2_28)">
          <path
            d="M95 46.5C97.7614 46.5 100.038 44.2487 99.6206 41.519C98.2584 32.6138 93.2709 24.2738 85.3553 17.8622C75.9785 10.267 63.2608 6 50 6C36.7392 6 24.0215 10.267 14.6447 17.8622C6.72908 24.2738 1.74161 32.6138 0.379396 41.519C-0.0381584 44.2487 2.23858 46.5 5 46.5L25 46.5C27.7614 46.5 29.9262 44.1891 30.9303 41.6167C31.8892 39.16 33.5669 36.9005 35.8579 35.0449C39.6086 32.0068 44.6957 30.3 50 30.3C55.3043 30.3 60.3914 32.0068 64.1421 35.0449C66.4331 36.9005 68.1108 39.16 69.0697 41.6167C70.0738 44.1891 72.2386 46.5 75 46.5H95Z"
            fill={color}
          />
          <path
            d="M5 53.5C2.23857 53.5 -0.0381648 55.7513 0.379389 58.481C1.7416 67.3862 6.72907 75.7262 14.6447 82.1378C24.0215 89.733 36.7392 94 50 94C63.2608 94 75.9785 89.733 85.3553 82.1378C93.2709 75.7262 98.2584 67.3862 99.6206 58.481C100.038 55.7513 97.7614 53.5 95 53.5L75 53.5C72.2386 53.5 70.0738 55.8109 69.0697 58.3833C68.1108 60.84 66.4331 63.0995 64.1421 64.9551C60.3914 67.9932 55.3043 69.7 50 69.7C44.6957 69.7 39.6086 67.9932 35.8579 64.9551C33.5669 63.0995 31.8892 60.84 30.9302 58.3833C29.9262 55.8109 27.7614 53.5 25 53.5L5 53.5Z"
            fill={color}
          />
          <circle cx="50" cy="50" r="9" fill={color} />
          <rect
            x="89.0897"
            y="-1.91034"
            width="18.0601"
            height="128.711"
            rx="9.03004"
            transform="rotate(45 89.0897 -1.91034)"
            fill={color}
          />
        </g>
        <defs>
          <clipPath id="clip0_2_28">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }
}
