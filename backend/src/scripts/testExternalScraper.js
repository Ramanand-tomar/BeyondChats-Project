// testExternalScraper.js
import { testScraper } from "../services/externalScraper.service.js";

(async () => {
  console.log("🚀 Starting enhanced scraper tests with Puppeteer...\n");
  
  await testScraper();
  
  console.log("\n✅ All tests completed!");
})();