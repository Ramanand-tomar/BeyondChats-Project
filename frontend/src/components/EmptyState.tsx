import { FileX, Sparkles } from 'lucide-react';
import { TabType } from './ArticleTabs';

interface EmptyStateProps {
  activeTab: TabType;
}

export function EmptyState({ activeTab }: EmptyStateProps) {
  const isUpdated = activeTab === 'updated';
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
        {isUpdated ? (
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        ) : (
          <FileX className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        No {isUpdated ? 'Updated' : 'Original'} Articles
      </h3>
      <p className="text-muted-foreground max-w-md">
        {isUpdated 
          ? "There are no AI-enhanced articles available yet. Check back soon!"
          : "There are no original articles to display at the moment."
        }
      </p>
    </div>
  );
}
