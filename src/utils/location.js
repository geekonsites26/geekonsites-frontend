export const getLocation = () => {
  const location = localStorage.getItem("gos_location") || "UK";

  return {
    location,
    country:
      location === "US"
        ? "United States"
        : "United Kingdom",

    currency:
      location === "US"
        ? "USD"
        : "GBP",

    symbol:
      location === "US"
        ? "$"
        : "£",
  };
};