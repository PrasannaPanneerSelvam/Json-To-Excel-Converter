const setGlobalStyles = (function () {
  const globalStyles: CSSStyleDeclaration = document.body.style;
  return function (key: string, value: string) {
    globalStyles.setProperty(key, value);
  };
})();

export { setGlobalStyles };
