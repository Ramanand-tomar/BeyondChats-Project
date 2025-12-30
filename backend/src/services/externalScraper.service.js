// externalScraper.service.js
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

// Clean unwanted spaces and junk
const cleanText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

// Scrape using Puppeteer (for JavaScript-heavy or blocked sites)
const scrapeWithPuppeteer = async (url) => {
  console.log("🌐 Using Puppeteer for:", url);
  
  let browser;
  try {
    // Launch browser with better stealth options
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Add extra headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });
    
    // Navigate to page
    console.log("⏳ Loading page...");
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait a bit for content to load
    // await page.waitForTimeout(2000);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to find and click "Read more" if it exists (for Medium)
    try {
      const readMoreButton = await page.$('button:has-text("Read more"), button:has-text("Continue reading")');
      if (readMoreButton) {
        console.log("📖 Clicking 'Read more' button...");
        await readMoreButton.click();
        // await page.waitForTimeout(1000);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (e) {
      // Ignore if button not found
    }
    
    // Extract content
    console.log("📄 Extracting content...");
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe', 
        'nav', 'header', 'footer', 'aside',
        '.ad', '.ads', '.advertisement',
        '.sidebar', '.social-share', '.comments',
        '.related-posts', 'form', '.subscribe',
        '.paywall', '.overlay', '.metabar'
      ];
      
      unwantedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      // Try to find main content
      let mainElement = document.querySelector('article') || 
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]') ||
                       document.querySelector('.post-content') ||
                       document.querySelector('.article-content') ||
                       document.querySelector('.entry-content') ||
                       document.body;
      
      // For Medium specifically
      if (window.location.hostname.includes('medium.com')) {
        const mediumArticle = document.querySelector('article') || 
                             document.querySelector('[data-testid="storyContent"]') ||
                             document.querySelector('.postArticle-content');
        if (mediumArticle) {
          mainElement = mediumArticle;
        }
      }
      
      // Extract text from meaningful elements
      const textElements = mainElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
      let extractedText = '';
      
      if (textElements.length > 3) {
        textElements.forEach(el => {
          const tagName = el.tagName.toLowerCase();
          const text = el.innerText.trim();
          
          if (text.length > 30 && !text.match(/^(subscribe|follow|clap|share)/i)) {
            if (tagName.startsWith('h')) {
              extractedText += `\n\n## ${text}\n`;
            } else {
              extractedText += text + '\n\n';
            }
          }
        });
      }
      
      // Fallback to all text
      if (extractedText.length < 300) {
        extractedText = mainElement.innerText;
      }
      
      return extractedText;
    });
    
    await browser.close();
    
    // Clean the extracted content
    const cleaned = cleanText(content)
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\.\s{2,}/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    
    console.log("✅ Puppeteer extraction complete");
    return cleaned;
    
  } catch (error) {
    console.error('❌ Puppeteer error:', error.message);
    if (browser) {
      await browser.close();
    }
    return '';
  }
};

// Try axios first, fallback to puppeteer
export const scrapeExternalArticle = async (url) => {
  console.log(`🔍 Scraping: ${url}`);
  
  // Always use Puppeteer for Medium (since it blocks axios)
  if (url.includes('medium.com')) {
    return await scrapeWithPuppeteer(url);
  }
  
  // For other sites, try axios first
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    
    // Remove unwanted elements
    $('script, style, noscript, iframe, nav, header, footer, aside, .ad, .sidebar, .comments').remove();
    
    // Find main content
    const selectors = [
      'article', 'main', '[role="main"]',
      '.post-content', '.article-content', '.entry-content',
      '.content', '.post-body', '.blog-content'
    ];
    
    let $content = null;
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 200) {
        $content = element;
        break;
      }
    }
    
    if (!$content) {
      $content = $('body');
    }
    
    // Extract paragraphs
    let content = '';
    $content.find('p, h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = cleanText($(el).text());
      if (text.length > 40) {
        content += text + '\n\n';
      }
    });
    
    if (content.length < 300) {
      content = cleanText($content.text());
    }
    
    return content.trim() || await scrapeWithPuppeteer(url);
    
  } catch (error) {
    console.log(`⚠️ Axios failed (${error.message}), falling back to Puppeteer...`);
    return await scrapeWithPuppeteer(url);
  }
};

// Remove testScraper and do not hardcode URLs anywhere

// Main function to process a single URL and print content
export const processAndPrintArticle = async (url) => {
  console.log('\n' + '='.repeat(70));
  console.log(`Processing: ${url}`);
  console.log('='.repeat(70));

  const startTime = Date.now();
  const content = await scrapeExternalArticle(url);
  const timeTaken = Date.now() - startTime;

  if (content && content.length > 100) {
    console.log(`✅ Success! (${timeTaken}ms)`);
    console.log(`${content}...`);
    console.log(`📏 Length: ${content.length} characters`);
    console.log('\nPreview (first 600 chars):');
    console.log('-'.repeat(40));
    console.log(content.slice(0, 600) + '...');
    console.log('-'.repeat(40));
  } else {
    console.log(`❌ Failed or insufficient content (${content?.length || 0} chars)`);
  }
};

// For multiple URLs
export const processAndPrintArticles = async (blogLinksArray) => {
  for (const [index, url] of blogLinksArray.entries()) {
    console.log(`\n--- [${index + 1}/${blogLinksArray.length}] Processing: ${url} ---`);
    await processAndPrintArticle(url);
    // Respectful delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

// Keep the scrapeAndSaveArticles function (simplified)
export const scrapeAndSaveArticles = async (blogLinksArray) => {
  const articles = [];
  
  for (const [index, url] of blogLinksArray.entries()) {
    console.log(`\n--- [${index + 1}/${blogLinksArray.length}] Processing: ${url} ---`);
    
    try {
      const content = await scrapeExternalArticle(url);
      
      if (content && content.length > 100) {
        const article = {
          title: `Article from ${new URL(url).hostname}`,
          content,
          sourceUrl: url,
          author: 'Unknown',
          date: new Date().toISOString().split('T')[0],
          references: [],
          isUpdated: false
        };
        
        console.log(`✅ Extracted ${content.length} characters`);
        articles.push(article);
      } else {
        console.log(`⚠️ Skipping - insufficient content (${content?.length || 0} chars)`);
      }
      
      // Respectful delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  return articles;
};