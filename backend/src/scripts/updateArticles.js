import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Article from "../models/Article.js";

import { searchGoogle } from "../services/googleSearch.service.js";
import { scrapeExternalArticle } from "../services/externalScraper.service.js";
import { rewriteWithLLM } from "../services/llmRewrite.service.js";
import UpdatedArticles from "../models/UpdatedArticles.js";

dotenv.config();
await connectDB();

const updateOneArticle = async () => {
  const article = await Article.findOne({ isUpdated: false });

  if (!article) {
    console.log("🎯 No articles left to update");
    process.exit(0);
  }

  console.log(`🔄 Processing: ${article.title}`);

  // 1️⃣ Google Search
  const googleResults = await searchGoogle(article.title);
  if (googleResults.length < 2) {
    console.log("❌ Not enough Google results");
    process.exit(0);
  }

  console.log(`✅ Google results found: ${googleResults}`);

  const ref1 = await scrapeExternalArticle(googleResults[0].link);
  const ref2 = await scrapeExternalArticle(googleResults[1].link);

  console.log(`✅ Reference articles scraped (${ref1.slice(0, 600)} chars, ${ref2.slice(0, 600)} chars) , ${googleResults}`);

  // 2️⃣ LLM Rewrite
  const updatedContent = await rewriteWithLLM({
    originalArticle: article.content,
    refArticle1: ref1,
    refArticle2: ref2
  });

  // 3️⃣ Add references
  const finalContent = `
${updatedContent}
`;

  // 4️⃣ Save updated article in UpdatedArticles
  console.log(`finalContent: ${finalContent}`);
  const updatedArticle = new UpdatedArticles({
    title: article.title,
    content: finalContent,
    sourceUrl: article.sourceUrl,
    author: article.author,
    date: article.date,
    references: [
      googleResults[0].link,
      googleResults[1].link
    ],
    isUpdated: true
  });
  await updatedArticle.save();

  // Update original article's isUpdated to true
  article.isUpdated = true;
  await article.save();

  console.log(`✅ Updated: ${article.title}`);
  process.exit(0);
};

updateOneArticle();
