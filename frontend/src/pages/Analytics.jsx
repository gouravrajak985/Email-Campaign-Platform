import { Card, CardContent } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

function Analytics() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Analytics</h1>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            We're working on bringing you powerful analytics features to help you track and optimize your email campaigns. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;