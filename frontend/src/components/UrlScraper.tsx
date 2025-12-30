import { useState } from 'react';
import { Globe, Loader2, LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { scrapeUrl, Article } from '@/lib/api';

interface UrlScraperProps {
  onArticleScraped: (article: Article) => void;
}

export function UrlScraper({ onArticleScraped }: UrlScraperProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a blog post URL to scrape.');
      return;
    }

    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    if (!isValidUrl(formattedUrl)) {
      toast.error('Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await scrapeUrl(formattedUrl);
      
      if (result.success) {
        onArticleScraped(result.article);
        setLastScraped(formattedUrl);
        setUrl('');
        toast.success(`"${result.article.title}" has been added to original articles.`);
      } else {
        toast.error(result.message || 'Failed to scrape the article.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-accent/30 bg-accent/5 hover:border-accent/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">Scrape Blog Post</h3>
            <p className="text-sm text-muted-foreground">Enter a URL to extract article content</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="https://beyondchats.com/blogs/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 bg-background"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Scrape URL
              </>
            )}
          </Button>
        </form>
        
        {lastScraped && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="truncate">
              Last scraped: <span className="font-medium text-foreground">{lastScraped}</span>
            </span>
          </div>
        )}
        
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Supports BeyondChats blog posts and most public blog URLs. The scraper extracts main content and removes navigation/ads.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
