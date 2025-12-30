
import { Router } from "express";
import {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
  getOneArticle,
  updateAndRewriteArticle,
  GetAllUpdatedArticles,
  scrapeArticleFromUrl,
  scrapeOldBlogs_Five
} from "../controllers/article.controller.js";
// Update and rewrite article by ID
const router = Router();



router.post("/original", createArticle);
router.get("/original", getArticles);
router.get("/original/:id", getOneArticle);
router.put("/original/:id", updateArticle);
router.delete("/original/:id", deleteArticle);
router.post("/update-rewrite/:id", updateAndRewriteArticle);
router.get("/updated/all", GetAllUpdatedArticles);
router.post("/scrape-from-url", scrapeArticleFromUrl);
router.post("/scrape-old-blogs-five", scrapeOldBlogs_Five);


export default router;
