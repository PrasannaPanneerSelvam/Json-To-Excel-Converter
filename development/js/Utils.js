const setGlobalStyles = (function () {
  const globalStyles = document.body.style;
  return function (key, value) {
    globalStyles.setProperty(key, value);
  };
})();

export { setGlobalStyles };
