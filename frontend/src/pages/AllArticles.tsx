import { useState, useEffect } from 'react';
import { Database, Search, Filter, RefreshCw, Sparkles, FileText, Calendar, ExternalLink } from 'lucide-react';
import { fetchArticles, Article } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
const AllArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'updated' | 'original'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    let result = [...articles];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType === 'updated') {
      result = result.filter(article => article.isUpdated);
    } else if (filterType === 'original') {
      result = result.filter(article => !article.isUpdated);
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    
    setFilteredArticles(result);
  }, [articles, searchQuery, filterType, sortBy]);

  const stats = {
    total: articles.length,
    updated: articles.filter(a => a.isUpdated).length,
    original: articles.filter(a => !a.isUpdated).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  All Articles
                </h1>
                <p className="text-sm text-muted-foreground">Complete database overview</p>
              </div>
            </div>
            <Button onClick={loadArticles} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-up">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <p className="text-3xl font-bold text-foreground font-heading">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Enhanced</p>
                  <p className="text-3xl font-bold text-foreground font-heading">{stats.updated}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Original</p>
                  <p className="text-3xl font-bold text-foreground font-heading">{stats.original}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up stagger-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="updated">AI Enhanced</SelectItem>
                <SelectItem value="original">Original</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">By Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>

        {/* Articles Table/List */}
        <div className="space-y-3 animate-fade-up stagger-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </Card>
            ))
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadArticles} variant="outline">Try Again</Button>
            </Card>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </Card>
          ) : (
            filteredArticles.map((article, index) => (
              <Card 
                key={article._id} 
                className="p-4 hover:shadow-card-hover transition-all duration-200 opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    article.isUpdated 
                      ? 'bg-accent/10' 
                      : 'bg-muted'
                  }`}>
                    {article.isUpdated ? (
                      <Sparkles className="h-5 w-5 text-accent" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground truncate mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {article.references.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {article.references.length} ref{article.references.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={article.isUpdated ? 'default' : 'secondary'}
                    className={article.isUpdated ? 'bg-accent text-accent-foreground' : ''}
                  >
                    {article.isUpdated ? 'AI Enhanced' : 'Original'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AllArticles;