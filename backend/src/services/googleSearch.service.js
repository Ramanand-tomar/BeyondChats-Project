import axios from "axios";

const SERPER_URL = "https://google.serper.dev/search";

export const searchGoogle = async (query, num = 2) => {
  const response = await axios.post(
    SERPER_URL,
    {
      q: query,
      num
    },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  // Return top organic results
  const organicResults = response.data.organic || [];
  return organicResults.slice(0, num);
};
