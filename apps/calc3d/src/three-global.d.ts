/** Three.js подключается через CDN в `index.html` (`window.THREE`). */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    THREE: any;
  }
}

export {};
