export const environment = (() => {
  const production = false;
  return {
    production,
    safTChildApiUrl: production
      ? 'https://api.safTChild.com'
      : 'https://localhost:5000',
  };
})();

export const windowBreakpoint = 768;
