import dotenv from "dotenv";
import { searchGoogle } from "../services/googleSearch.service.js";

dotenv.config();

const test = async () => {
  const results = await searchGoogle(
    "What is blockchain in healthcare"
  );

  console.log(
    results.map((r) => ({
      title: r.title,
      link: r.link
    }))
  );
};

test();
