// esbuild aliases "react" to this so the bundle uses the React that index.html
// loads from a CDN, instead of bundling its own copy.
const React = window.React;
export default React;
export const { useState, useEffect, useMemo, useRef, Fragment, createElement } = React;
