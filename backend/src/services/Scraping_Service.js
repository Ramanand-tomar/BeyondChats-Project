import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Article from "../models/Article.js";

dotenv.config();

// Utility: clean extra spaces and remove all newlines
const cleanText = (text) =>
  text ? text.replace(/\s+/g, " ").replace(/\n/g, " ").trim() : "";

const scrapeFullArticle = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let content = "";

    // Try to get the main article content - looking at your HTML structure
    const articleContainer = $('.elementor-element.elementor-element-b2a436b.elementor-widget.elementor-widget-theme-post-content');

    if (articleContainer.length) {
      // Extract all text elements from the article
      articleContainer.find('h2, h3, h4, p, figure, ul, ol').each((_, el) => {
        const element = $(el);

        // Handle headings
        if (element.is('h2, h3, h4')) {
          content += ` ${cleanText(element.text())} `;
        }
        // Handle paragraphs
        else if (element.is('p')) {
          content += `${cleanText(element.text())} `;
        }
        // Handle images
        else if (element.is('figure')) {
          const img = element.find('img');
          const altText = img.attr('alt') || 'Image';
          const src = img.attr('src');
          if (src) {
            content += `[Image: ${altText} - ${src}] `;
          }
        }
        // Handle lists
        else if (element.is('ul, ol')) {
          element.find('li').each((_, li) => {
            content += `• ${cleanText($(li).text())} `;
          });
        }
      });
    }

    // Fallback if the specific container is not found
    if (!content.trim()) {
      $('article, .post-content, .entry-content, .elementor-post-content').each((_, el) => {
        content += cleanText($(el).text()) + ' ';
      });
    }

    // Remove all newlines (should already be handled by cleanText, but just in case)
    return content.replace(/\n/g, " ").trim();
  } catch (error) {
    console.error(`❌ Error scraping article: ${url}`, error.message);
    return "Error: Could not extract content";
  }
};

/**
 * Scrape a single article from a given URL and save to DB
 * @param {string} url - The URL to scrape for the article
 * @returns {Promise<Object>} - Result object with success status and data
 */
const scrapeSingleArticle = async (url) => {
  try {
    await connectDB();
    console.log(`🔍 Fetching article page: ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract metadata
    const title = cleanText($('h1').first().text()) || 
                 cleanText($('title').first().text().split(' - ')[0]) ||
                 cleanText($('meta[property="og:title"]').attr('content')) ||
                 'Untitled';

    const author = cleanText($('.elementor-post-info__item--type-author').first().text()) || 
                  cleanText($('.author').first().text()) ||
                  cleanText($('meta[name="author"]').attr('content')) ||
                  cleanText($('a[rel="author"]').first().text()) ||
                  'Unknown Author';

    const date = cleanText($('.elementor-post-info__item--type-date').first().text()) || 
                cleanText($('time').first().text()) ||
                cleanText($('meta[property="article:published_time"]').attr('content')) ||
                cleanText($('meta[name="date"]').attr('content')) ||
                'Unknown Date';

    let content = await scrapeFullArticle(url);
    content = content.replace(/\n/g, " ").trim();

    const article = {
      title,
      content,
      sourceUrl: url,
      author,
      date,
      references: [],
      isUpdated: false,
      scrapedAt: new Date()
    };
    console.log(`📰 Article extracted: ${author}`);

    

    // Check if article already exists in database
    const existingArticle = await Article.findOne({ 
      $or: [
        { sourceUrl: url },
        { title: title }
      ]
    });

    if (existingArticle) {
      existingArticle.content = content;
      existingArticle.author = author;
      existingArticle.date = date;
      existingArticle.isUpdated = true;
      existingArticle.lastScraped = new Date();
    //   await existingArticle.save();
      console.log(`🔄 Updated existing article: ${title}`);
      return { success: true, message: "Article updated", data: existingArticle };
    } else {
      const saved = await Article.create(article);
      console.log(`✅ Saved new article: ${title}`);
      return { success: true, message: "Article scraped and saved", data: saved };
    }
  } catch (error) {
    console.error('❌ Error scraping article:', error.message);
    return { success: false, message: `Error: ${error.message}` };
  }
};

export default scrapeSingleArticle;

