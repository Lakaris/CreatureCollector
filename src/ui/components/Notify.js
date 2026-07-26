// Transient inline notification banner.

import React from "../../react.js";

function Notify({msg}){
  if(!msg)return null;
  return React.createElement("div",{className:"notify"},msg);
}

export default Notify;
