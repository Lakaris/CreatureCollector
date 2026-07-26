// Ascension star display.

import React from "../../react.js";

function AscStars({n}){
  if(!n)return null;
  if(n<=5)return React.createElement("span",{className:"asc-stars"},"★".repeat(n));
  return React.createElement("span",{className:"asc-stars"},n+"★");
}

export default AscStars;
