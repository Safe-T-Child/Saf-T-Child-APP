export const environment = (() => {
  const production = false;
  return {
    production,
    safTChildApiUrl: production
      ? 'https://saf-t-child-services.azurewebsites.net'
      : 'https://localhost:5000',
  };
})();

export const windowBreakpoint = 768;
