import { Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'updated' | 'original';

interface ArticleTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  updatedCount: number;
  originalCount: number;
}

export function ArticleTabs({ activeTab, onTabChange, updatedCount, originalCount }: ArticleTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-secondary/50 p-1.5 border border-border/50">
        <button
          onClick={() => onTabChange('updated')}
          className={cn(
            'relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300',
            activeTab === 'updated'
              ? 'bg-card text-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className={cn(
            'h-4 w-4 transition-colors duration-300',
            activeTab === 'updated' ? 'text-accent' : ''
          )} />
          <span>AI Updated</span>
          <span className={cn(
            'ml-1 px-2 py-0.5 text-xs rounded-full transition-colors duration-300',
            activeTab === 'updated' 
              ? 'bg-accent/10 text-accent' 
              : 'bg-muted text-muted-foreground'
          )}>
            {updatedCount}
          </span>
        </button>
        
        <button
          onClick={() => onTabChange('original')}
          className={cn(
            'relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300',
            activeTab === 'original'
              ? 'bg-card text-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Original</span>
          <span className={cn(
            'ml-1 px-2 py-0.5 text-xs rounded-full transition-colors duration-300',
            activeTab === 'original' 
              ? 'bg-accent/10 text-accent' 
              : 'bg-muted text-muted-foreground'
          )}>
            {originalCount}
          </span>
        </button>
      </div>
    </div>
  );
}
