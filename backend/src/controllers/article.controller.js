

import UpdatedArticles from "../models/UpdatedArticles.js";
import { searchGoogle } from "../services/googleSearch.service.js";
import { scrapeExternalArticle } from "../services/externalScraper.service.js";
import { rewriteWithLLM } from "../services/llmRewrite.service.js";
import Article from "../models/Article.js";
import scrapeSingleArticle from "../services/Scraping_Service.js";
import scrapeBlogs from "../scraper/scrapeOldBlogs.js";


// Update and rewrite article by ID, save to UpdatedArticles, and mark original as updated
export const updateAndRewriteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    if (article.isUpdated) {
      return res.status(400).json({ message: "Article already updated" });
    }

    // Google Search
    const googleResults = await searchGoogle(article.title);
    if (!googleResults || googleResults.length < 2) {
      return res.status(400).json({ message: "Not enough Google results" });
    }

    const ref1 = await scrapeExternalArticle(googleResults[0].link);
    const ref2 = await scrapeExternalArticle(googleResults[1].link);

    // LLM Rewrite
    const updatedContent = await rewriteWithLLM({
      originalArticle: article.content,
      refArticle1: ref1,
      refArticle2: ref2
    });

    const finalContent = `\n${updatedContent}\n`;
    

    // Save to UpdatedArticles
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
    console.log(`finalContent: ${updatedArticle.references}`);
    await updatedArticle.save();

    // Mark original as updated
    article.isUpdated = true;
    await article.save();

    res.json({ message: "Article updated and rewritten", updatedArticle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createArticle = async (req, res) => {
  const article = await Article.create(req.body);
  res.status(201).json(article);
};

export const getArticles = async (req, res) => {
  const articles = await Article.find().sort({ createdAt: -1 });
  res.json(articles);
};

export const getOneArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};

export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteArticle = async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  res.json(article);
};


export const GetAllUpdatedArticles = async (req, res) => {
  try {
    const updatedArticles = await UpdatedArticles.find().sort({ createdAt: -1 });
    res.json(updatedArticles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const scrapeArticleFromUrl = async (req, res) => {
  const { url } = req.body;
  try {
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    const result = await scrapeSingleArticle(url);
    if (result.success && result.data) {
      return res.json({
        success: true,
        article: result.data,
        message: result.message
      });
    }
    res.status(400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const scrapeOldBlogs_Five = async (req, res) => {
  try {
    const result = await scrapeBlogs("https://beyondchats.com/blogs/", 5);
    res.json({ 
      success: result.success, 
      message: result.message,
      data: result.data || [],
      total: result.total || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


