export const getEnv = (url) => {
  url = url || window?.location?.href;
  if (url?.includes("localhost")) {
    return {
      apiEndpoint: "http://localhost:3000/api",
    };
  }
  return {
    apiEndpoint: "https://api.mvadney.com", // TODO: update when live
  };
};
