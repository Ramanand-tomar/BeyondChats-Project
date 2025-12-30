import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden border-border/50">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
