export const DEBUG =  process.env.REACT_APP_ENVIRONMENT === "dev";

export const BASE_URL = DEBUG ? "http://localhost:3001" : "https://travelcostapi.apanjain.dev";