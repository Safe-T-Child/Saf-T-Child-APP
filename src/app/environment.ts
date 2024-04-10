export const environment = (() => {
  const production = true;
  return {
    production,
    safTChildApiUrl: production
      ? 'saf-t-child-services.azurewebsites.net'
      : 'https://localhost:5000',
  };
})();

export const windowBreakpoint = 768;
