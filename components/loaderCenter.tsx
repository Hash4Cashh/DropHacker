import React from "react";
export function LoaderCenter({
  number = "7",
  size = "450px",
  color = "black",
  style = {},
  containerStyle = {},
  loaderStyle = {}
}) {
  return (
    <div style={{position: "fixed", width: "100vw", height: "90vh",display: "flex", flex: "1", justifyContent: "center", alignItems: "center",  ...containerStyle}}>
      <div
        className={`my-loader my-loader-${color} my-loader-${number}`}
        style={{ ...style, width: size, height: size, ...loaderStyle }}
      />
    </div>
  );
}
