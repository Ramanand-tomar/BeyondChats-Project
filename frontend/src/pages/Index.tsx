import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { fetchArticles, fetchUpdatedArticles, Article } from '@/lib/api';
import { Header } from '@/components/Header';
import { ArticleTabs, TabType } from '@/components/ArticleTabs';
import { ArticleCard } from '@/components/ArticleCard';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { UrlScraper } from '@/components/UrlScraper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [originalArticles, setOriginalArticles] = useState<Article[]>([]);
  const [updatedArticles, setUpdatedArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('updated');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [original, updated] = await Promise.all([
        fetchArticles(),
        fetchUpdatedArticles()
      ]);
      setOriginalArticles(original);
      setUpdatedArticles(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleArticleScraped = (newArticle: Article) => {
    setOriginalArticles(prev => [newArticle, ...prev]);
    setActiveTab('original');
  };

  const handleArticleConverted = (convertedArticle: Article) => {
    setUpdatedArticles(prev => [convertedArticle, ...prev]);
    setActiveTab('updated');
  };

  const displayedArticles = activeTab === 'updated' ? updatedArticles : originalArticles;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 animate-fade-up">
            Discover Insightful Articles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up stagger-1">
            Explore our collection of articles, enhanced by AI for clarity and depth, 
            or browse the original content.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up stagger-1">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold font-heading text-foreground">{updatedArticles.length}</p>
              <p className="text-xs text-muted-foreground">AI Enhanced</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold font-heading text-foreground">{originalArticles.length}</p>
              <p className="text-xs text-muted-foreground">Original</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">View All Articles</p>
                <p className="text-xs text-muted-foreground">Browse complete database</p>
              </div>
              <Link to="/articles">
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="h-4 w-4" />
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* URL Scraper */}
        <div className="mb-8 md:mb-10 animate-fade-up stagger-2">
          <UrlScraper onArticleScraped={handleArticleScraped} />
        </div>

        {/* Tabs */}
        <div className="mb-8 md:mb-10 animate-fade-up stagger-2">
          <ArticleTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            updatedCount={updatedArticles.length}
            originalCount={originalArticles.length}
          />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadArticles} />
          ) : displayedArticles.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            displayedArticles.map((article, index) => (
              <ArticleCard 
                key={article._id} 
                article={article} 
                index={index}
                showConvertButton={activeTab === 'original'}
                onConverted={handleArticleConverted}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeyondChats Articles. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
