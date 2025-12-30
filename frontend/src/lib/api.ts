export interface Article {
  _id: string;
  title: string;
  content: string;
  isUpdated: boolean;
  references: string[];
  createdAt: string;
  sourceUrl?: string;
  author?: string;
  readTime?: string;
}

export interface ScrapeResult {
  success: boolean;
  article: Article;
  message: string;
}

export interface ConvertResult {
  success: boolean;
  article: Article;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/articles';


// Fetch all original articles
export async function fetchArticles(): Promise<Article[]> {

  const response = await fetch(`${API_BASE_URL}/original`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

// Fetch all updated articles
export async function fetchUpdatedArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/updated/all`);
  if (!response.ok) {
    throw new Error('Failed to fetch updated articles');
  }
  return response.json();
}

// Fetch a single article by ID
export async function getArticleById(articleId: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/original/${articleId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

// Create a new article
export async function createArticle(article: Omit<Article, '_id' | 'createdAt'>): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/original`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
  if (!response.ok) {
    throw new Error('Failed to create article');
  }
  return response.json();
}

// Update an article
export async function updateArticle(articleId: string, article: Partial<Article>): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/original/${articleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
  if (!response.ok) {
    throw new Error('Failed to update article');
  }
  return response.json();
}

// Delete an article
export async function deleteArticle(articleId: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/original/${articleId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete article');
  }
  return response.json();
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(`${API_BASE_URL}/scrape-from-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to scrape URL');
  }
  return response.json();
}

// Scrape 5 old BeyondChats blogs
export async function scrapeOldBlogs(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/scrape-old-blogs-five`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to scrape old blogs');
  }
  return response.json();
}

export async function convertArticle(articleId: string): Promise<ConvertResult> {
  
  const response = await fetch(`${API_BASE_URL}/update-rewrite/${articleId}`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to convert article');
  }
  
  return response.json();
}
