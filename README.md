# BeyondChats - AI-Enhanced Article Management Platform

A full-stack web application that scrapes, manages, and enhances articles using AI. This platform allows users to fetch articles from URLs, enhance them with AI-powered rewrites using Google's Gemini API, and display both original and enhanced versions side-by-side.

## 🌟 Features

### Core Features
- **URL-Based Article Scraping**: Scrape articles from any URL with automatic content extraction
- **Batch Blog Scraping**: Scrape multiple articles from BeyondChats blog with fallback support
- **AI Article Enhancement**: Rewrite articles using Google Gemini AI for improved clarity and readability
- **Google Source Integration**: Automatically fetch and display top 2 Google-indexed sources for each article
- **Dual Article Management**: Separate storage and display of original vs AI-enhanced articles
- **Full CRUD Operations**: Create, read, update, and delete articles
- **Advanced Search & Filtering**: Search by title/content, filter by article type, and sort by date/title
- **Responsive UI**: Beautiful, mobile-friendly interface with smooth animations
- **Real-time Updates**: Live article counts and instant status updates

### Article Management
- **Original Articles Tab**: View unmodified articles with convert-to-AI option
- **AI Enhanced Tab**: View AI-rewritten articles with enhanced content
- **All Articles View**: Browse complete database with advanced filtering
- **Article Metadata**: Display author, date, read time, and reference count
- **References Section**: Show all cited sources with numbered links
- **Badge System**: Visual indicators for article type (Original/AI Enhanced)

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS
- **UI Components**: shadcn/ui (pre-built, customizable components)
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Animation**: CSS animations with Tailwind

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **API Style**: RESTful
- **Authentication**: API Key-based (GEMINI_API_KEY, SERPER_API_KEY)

### External APIs
- **LLM**: Google Gemini 2.5 Flash API (AI article rewriting)
- **Search**: Serper API (Google Search integration)
- **Web Scraping**: Puppeteer + Cheerio (HTML parsing)

### Development Tools
- **Package Manager**: npm / bun
- **Version Control**: Git
- **Environment Management**: dotenv
- **Dev Server**: Vite dev server, nodemon (backend)

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v16 or higher
- **npm** or **bun** package manager
- **MongoDB** Atlas account (cloud) or local MongoDB installation
- **Google Gemini API** key from [Google Cloud Console](https://cloud.google.com/docs/authentication/getting-started)
- **Serper API** key from [Serper.dev](https://serper.dev)

## 🚀 Setup Instructions

### 1. Clone/Extract Project
```bash
# Navigate to project directory
cd "BeyondChats Project"
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# API Keys
GEMINI_API_KEY=your_google_gemini_api_key
SERPER_API_KEY=your_serper_api_key

# LLM Configuration
GEMINI_MODEL=gemini-2.5-flash
```

**Getting API Keys:**
- **GEMINI_API_KEY**: Get from [Google Cloud Console](https://console.cloud.google.com/) → Enable Generative AI API
- **SERPER_API_KEY**: Sign up at [Serper.dev](https://serper.dev) and generate API key
- **MONGO_URI**: Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### Start Backend Server
```bash
npm start
```
The server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd Frontend
npm install
# or
bun install
```

#### Configure Environment (Optional)
A `.env` file is included for API base URL configuration. Default points to `http://localhost:5000`

#### Start Development Server
```bash
npm run dev
# or
bun run dev
```
The application will open at `http://localhost:5173`

## 📚 API Endpoints

### Articles Management

#### Get All Original Articles
```http
GET /api/articles/original
```
Returns all original articles with pagination support.

#### Get Single Article
```http
GET /api/articles/original/:id
```
Returns a specific article by ID.

#### Create Article
```http
POST /api/articles/original
Content-Type: application/json

{
  "title": "Article Title",
  "content": "<p>Article content in HTML</p>",
  "author": "Author Name",
  "sourceUrl": "https://source.com"
}
```

#### Update Article
```http
PUT /api/articles/original/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### Delete Article
```http
DELETE /api/articles/original/:id
```

### Article Enhancement & Scraping

#### Enhance Article with AI
```http
POST /api/articles/update-rewrite/:id
```
Fetches Google search results, uses reference articles to enhance the original, and saves to UpdatedArticles collection.

**Response:**
```json
{
  "success": true,
  "message": "Article enhanced and saved to UpdatedArticles",
  "data": {
    "_id": "article_id",
    "title": "Enhanced Article Title",
    "content": "<p>AI-enhanced content</p>",
    "references": ["url1", "url2"],
    "isUpdated": true
  }
}
```

#### Get All AI-Enhanced Articles
```http
GET /api/articles/updated/all
```
Returns all articles from UpdatedArticles collection.

#### Scrape Article from URL
```http
POST /api/articles/scrape-from-url
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```
Scrapes content from provided URL and saves as original article.

#### Batch Scrape BeyondChats Blogs
```http
POST /api/articles/scrape-old-blogs-five
```
Automatically scrapes 5 recent BeyondChats blog articles with fallback support.

**Response:**
```json
{
  "success": true,
  "message": "Scraped and saved 5 articles",
  "data": [
    { "article_1_data" },
    { "article_2_data" }
  ],
  "total": 5
}
```

## 🎯 Usage Guide

### For Users (Frontend)

#### 1. **Browse Articles**
- Visit the home page to see AI-enhanced articles
- Switch to "Original" tab to view original articles
- Use "View All" button to access complete database

#### 2. **Scrape New Article**
- Enter URL in the "URL Scraper" section
- Click "Scrape Article"
- Article appears in Original articles tab

#### 3. **Enhance Article with AI**
- Go to "Original" articles tab
- Click "Enhance with AI" button on desired article
- System fetches Google sources and rewrites content
- Enhanced article appears in "AI Enhanced" tab with "AI Enhanced" badge

#### 4. **Search & Filter**
- Use search bar to find articles by title or content
- Filter by article type (All/Original/AI Enhanced)
- Sort by date (newest/oldest) or alphabetically

#### 5. **View References**
- Google sources (top 2) displayed at top of article card
- Full reference list in "References" section
- Click any reference to open in new tab

### For Developers

#### Running Tests
```bash
# Backend - Run specific service test
node src/scripts/testExternalScraper.js
node src/scripts/testGoogleSearch.js
node src/scripts/updateArticles.js
```

#### Understanding Architecture

**Frontend Structure:**
```
Frontend/src/
├── pages/
│   ├── Index.tsx (Home page)
│   ├── AllArticles.tsx (Database view)
│   └── NotFound.tsx
├── components/
│   ├── ArticleCard.tsx (Article display)
│   ├── ArticleTabs.tsx (Tab switcher)
│   ├── UrlScraper.tsx (Scraping form)
│   └── ui/ (shadcn components)
└── lib/
    └── api.ts (API client)
```

**Backend Structure:**
```
backend/src/
├── controllers/
│   └── article.controller.js (API handlers)
├── models/
│   ├── Article.js (Original articles)
│   └── UpdatedArticles.js (Enhanced articles)
├── routes/
│   └── article.routes.js (API endpoints)
├── services/
│   ├── llmRewrite.service.js (Gemini integration)
│   ├── googleSearch.service.js (Serper integration)
│   ├── externalScraper.service.js (Web scraping)
│   └── Scraping_Service.js (Single article scraper)
└── config/
    └── db.js (MongoDB connection)
```

## 🔧 Configuration

### Database Models

#### Article (Original)
```javascript
{
  _id: ObjectId,
  title: String,
  content: String (HTML),
  author: String,
  readTime: String,
  sourceUrl: String,
  references: [String],
  isUpdated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### UpdatedArticles (Enhanced)
```javascript
{
  _id: ObjectId,
  title: String,
  content: String (HTML),
  author: String,
  readTime: String,
  sourceUrl: String,
  references: [String],
  isUpdated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Backend won't start**
```bash
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Kill process on port 5000 (Windows)
taskkill /PID <PID> /F

# Or change PORT in .env to different number
```

#### 2. **GEMINI_API_KEY shows as undefined**
- Ensure `.env` file exists in backend directory
- Remove quotes around API keys in `.env`
- Restart backend server after updating `.env`

```env
# ❌ Wrong
GEMINI_API_KEY="AIzaSy..."

# ✅ Correct
GEMINI_API_KEY=AIzaSy...
```

#### 3. **MongoDB connection fails**
- Verify MONGO_URI in `.env`
- Check if IP is whitelisted in MongoDB Atlas
- Ensure network access is enabled

#### 4. **AI Enhancement fails**
- Verify GEMINI_API_KEY is valid
- Check API quota at Google Cloud Console
- Ensure Generative AI API is enabled

#### 5. **Articles not scraping**
- Check SERPER_API_KEY validity
- Verify URL is accessible
- Check browser console for detailed errors

## 📈 Performance Tips

- **Frontend**: Enable caching in browser DevTools for faster development
- **Backend**: Use MongoDB indexes on frequently searched fields
- **API Calls**: Implement request debouncing for search/filter operations
- **Scraping**: Use batch scraping for multiple articles instead of individual requests

## 🔐 Security Considerations

- **API Keys**: Never commit `.env` file to version control
- **CORS**: Configure CORS properly for production
- **Input Validation**: All user inputs are sanitized before processing
- **Database**: Use strong MongoDB passwords and IP whitelisting

## 📝 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check backend console logs for error details
4. Verify all API keys and environment variables are correctly set

## 🚀 Future Enhancements

- User authentication and roles
- Article analytics and metrics
- Advanced scheduling for batch scraping
- Custom AI enhancement prompts
- Multi-language support
- Article versioning and history
- Export articles to PDF/Word
- Webhook integrations

---

**Last Updated**: December 30, 2025  
**Version**: 1.0.0
