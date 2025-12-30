import { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { convertArticle, Article } from '@/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConvertButtonProps {
  articleId: string;
  onConverted: (article: Article) => void;
  variant?: 'default' | 'compact';
}

export function ConvertButton({ articleId, onConverted, variant = 'default' }: ConvertButtonProps) {
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const result = await convertArticle(articleId);
      
      if (result.success) {
        onConverted(result.article);
        toast.success('The article has been enhanced with AI!');
      } else {
        toast.error(result.message || 'Failed to convert the article.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsConverting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={handleConvert}
            disabled={isConverting}
            className="h-9 w-9 border-accent/30 hover:border-accent hover:bg-accent/10"
          >
            {isConverting ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <Wand2 className="h-4 w-4 text-accent" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Convert with AI</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleConvert}
      disabled={isConverting}
      variant="outline"
      size="sm"
      className="gap-2 border-accent/30 hover:border-accent hover:bg-accent/10 text-accent hover:text-accent"
    >
      {isConverting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Converting...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Convert with AI
        </>
      )}
    </Button>
  );
}
