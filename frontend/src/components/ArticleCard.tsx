import { ExternalLink, Calendar, Sparkles, Clock, User } from 'lucide-react';
import { Article } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConvertButton } from '@/components/ConvertButton';

interface ArticleCardProps {
  article: Article;
  index: number;
  onConverted?: (article: Article) => void;
  showConvertButton?: boolean;
}

export function ArticleCard({ article, index, onConverted, showConvertButton = false }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get first 2 references (Google indexed URLs)
  const topReferences = article.references?.slice(0, 2) || [];

  return (
    <Card 
      className="opacity-0 animate-fade-up group overflow-hidden transition-all duration-300 hover:shadow-card-hover border-border/50"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
    >
      {/* Top Google Indexed URLs */}
      {topReferences.length > 0 && (
        <div className="bg-gradient-to-r from-accent/5 to-accent/10 border-b border-accent/20 px-6 py-3">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Google Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topReferences.map((ref, idx) => (
              <a
                key={idx}
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-accent transition-colors duration-200 truncate hover:underline flex items-center gap-1.5"
              >
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                  {idx + 1}
                </span>
                <span className="truncate">{ref}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.createdAt}>{formattedDate}</time>
              </span>
              {article.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              )}
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
              )}
              {showConvertButton ? (
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-border/50">
                  Original
                </Badge>
              ) : (
                article.isUpdated && (
                  <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent border-accent/20">
                    <Sparkles className="h-3 w-3" />
                    AI Enhanced
                  </Badge>
                )
              )}
            </div>
            <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground group-hover:text-accent transition-colors duration-200 md:text-3xl">
              {article.title}
            </h2>
          </div>
          {showConvertButton && onConverted && (
            <ConvertButton articleId={article._id} onConverted={onConverted} />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 text-justify">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {article.references && article.references.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="font-heading text-lg font-medium text-foreground mb-3 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-accent" />
              References ({article.references.length})
            </h3>
            <ul className="space-y-2">
              {article.references.map((ref, refIndex) => (
                <li key={refIndex}>
                  <a
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-200 group/link"
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                      {refIndex + 1}
                    </span>
                    <span className="underline underline-offset-2 decoration-border group-hover/link:decoration-accent truncate max-w-[400px]">
                      {ref}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {article.sourceUrl && (
          <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Source URL</span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline truncate max-w-[300px]"
            >
              {article.sourceUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
