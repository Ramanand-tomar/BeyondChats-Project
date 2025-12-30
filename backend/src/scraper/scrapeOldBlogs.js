import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Article from "../models/Article.js";

dotenv.config();

const BASE_URL = "https://beyondchats.com";
const BLOGS_PAGE_URL = `https://beyondchats.com/blogs/`;

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

const scrapeBlogs = async (targetUrl = BLOGS_PAGE_URL, maxArticles = 5) => {
  try {
    await connectDB();

    console.log(`🔍 Fetching blogs page: ${targetUrl}`);
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);

    const blogLinks = new Set(); // Use Set to avoid duplicates

    console.log("🎯 Looking for blog links...");

    // Multiple strategies to find blog links based on the HTML structure
    const linkSelectors = [
      'article a[href*="/blogs/"]', // Article links
      '.elementor-post a[href*="/blogs/"]', // Elementor posts
      '.wp-block-post a[href*="/blogs/"]', // WordPress block posts
      'a[href*="/blogs/"][href*=".com/blogs/"]:not([href*="category"])' // General blog links
    ];

    // Try each selector strategy
    for (const selector of linkSelectors) {
      $(selector).each((_, el) => {
        let href = $(el).attr('href');
        if (href) {
          // Convert relative URLs to absolute
          if (href.startsWith('/')) {
            href = BASE_URL + href;
          }
          // Only add if it's a blog post (not categories, tags, etc.)
          if (href.includes('/blogs/') && 
              !href.includes('/category/') && 
              !href.includes('/tag/') &&
              !href.includes('/author/') &&
              !href.includes('/page/')) {
            blogLinks.add(href);
          }
        }
      });

      if (blogLinks.size > 0) {
        console.log(`✅ Found ${blogLinks.size} blog links using selector: ${selector}`);
        break; // Stop after first successful strategy
      }
    }

    // If still no links, try manual extraction from the provided HTML structure
    if (blogLinks.size === 0) {
      console.log("⚠️  No links found with standard selectors. Trying manual extraction...");

      // From your HTML structure, articles are in .elementor-post elements
      $('.elementor-post').each((_, el) => {
        const link = $(el).find('a.elementor-post__thumbnail__link, a.elementor-post__title');
        if (link.length) {
          let href = link.attr('href');
          if (href) {
            if (href.startsWith('/')) {
              href = BASE_URL + href;
            }
            blogLinks.add(href);
          }
        }
      });
    }

    // Convert Set to Array and limit to maxArticles
    const blogLinksArray = Array.from(blogLinks).slice(-maxArticles);

    console.log(`\n📊 Found ${blogLinksArray.length} unique blog links:`);
    blogLinksArray.forEach((link, index) => {
      console.log(`  [${index + 1}] ${link}`);
    });

    if (blogLinksArray.length === 0) {
      console.warn("\n⚠️  No blog links found. Using fallback method...");
      // Add some known blog URLs as fallback
      const fallbackBlogs = [
        "https://beyondchats.com/blogs/choosing-the-right-ai-chatbot-a-guide/",
        "https://beyondchats.com/blogs/google-ads-are-you-wasting-your-money-on-clicks/",
        "https://beyondchats.com/blogs/should-you-trust-ai-in-healthcare/",
        "https://beyondchats.com/blogs/why-we-are-building-yet-another-ai-chatbot/",
        "https://beyondchats.com/blogs/introduction-to-chatbots/"
      ];
      blogLinksArray.push(...fallbackBlogs);
    }

    // Scrape each blog
    console.log(`\n📄 Scraping ${blogLinksArray.length} articles...`);
    const articles = [];

    for (const [index, url] of blogLinksArray.entries()) {
      console.log(`\n--- Processing [${index + 1}/${blogLinksArray.length}] ${url} ---`);

      try {
        const { data } = await axios.get(url);
        const $$ = cheerio.load(data);

        // Extract metadata
        const title = cleanText($$('h1').first().text()) || 
                     cleanText($$('title').first().text().split(' - ')[0]) ||
                     'Untitled';

        // Extract author and date
        const author = cleanText($$('.elementor-post-info__item--type-author').first().text()) || 
                      cleanText($$('.author').first().text()) ||
                      'Unknown Author';

        const date = cleanText($$('.elementor-post-info__item--type-date').first().text()) || 
                    cleanText($$('time').first().text()) ||
                    'Unknown Date';

        // Get content
        let content = await scrapeFullArticle(url);

        // Remove all newlines from content
        content = content.replace(/\n/g, " ").trim();

        const article = {
          title,
          content,
          sourceUrl: url,
          author,
          date,
          references: [],
          isUpdated: false
        };

        // Save to MongoDB
        const saved = await Article.create(article);
        articles.push(saved);

        // Print summary
        console.log(`✅ Saved: ${title}`);
        console.log(`📝 Content Preview: ${content.substring(0, 150)}...`);
        console.log(`📊 Content Length: ${content.length} characters`);

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing ${url}:`, error.message);
      }
    }

    console.log("\n🎯 Scraping complete!");
    console.log(`📚 Total articles scraped and saved: ${articles.length}`);

    return {
      success: true,
      message: `Successfully scraped ${articles.length} articles`,
      data: articles,
      total: articles.length
    };

  } catch (error) {
    console.error('❌ Error scraping blogs:', error.message);
    return {
      success: false,
      message: `Error: ${error.message}`,
      data: [],
      total: 0
    };
  }
};

export default scrapeBlogs;