import { Link } from 'react-router-dom';
import { useComparison } from '@/hooks/useComparison';
import { Button } from '@/components/ui/button';
import { X, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const CompareBar = () => {
  const { properties, removeProperty, clearAll } = useComparison();

  if (properties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm">
              Compare ({properties.length}/4)
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-shrink-0"
              >
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop'}
                  alt={property.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {property.title}
                </span>
                <button
                  onClick={() => removeProperty(property.id)}
                  className="p-1 hover:bg-background rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Button asChild size="sm" disabled={properties.length < 2}>
              <Link to="/compare">
                Compare Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
