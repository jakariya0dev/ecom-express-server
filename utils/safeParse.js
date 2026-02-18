export const parseString = (data, fallback = null) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("JSON parse error:", error);
      return fallback;
    }
  } else {
    return data;
  }
}
  
