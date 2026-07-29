// React is loaded as a UMD global by the CDN <script> tags in index.html.
// This module re-exports it so the rest of the codebase can use normal imports instead
// of each file reaching for the global.
const React = globalThis.React;
const ReactDOM = globalThis.ReactDOM;

if (!React || !ReactDOM) {
  throw new Error(
    "React UMD globals missing. The CDN <script> tags in index.html must load before src/main.js."
  );
}

export const {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useContext,
  createContext,
  createElement,
  Fragment,
} = React;

export { ReactDOM };
export default React;
