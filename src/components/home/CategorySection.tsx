import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building2, TreeDeciduous, Store, Castle } from 'lucide-react';

const categories = [
  {
    title: 'Houses',
    description: 'Residential houses for families',
    icon: Home,
    link: '/properties?property_type=house',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Apartments',
    description: 'Modern apartments & flats',
    icon: Building2,
    link: '/properties?property_type=apartment',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    title: 'Land & Plots',
    description: 'Residential & commercial plots',
    icon: TreeDeciduous,
    link: '/properties?property_type=plot',
    color: 'bg-accent/10 text-accent-foreground',
  },
  {
    title: 'Commercial',
    description: 'Offices, shops & warehouses',
    icon: Store,
    link: '/properties?property_type=commercial',
    color: 'bg-destructive/10 text-destructive',
  },
  {
    title: 'Farmhouses',
    description: 'Luxury farmhouses & villas',
    icon: Castle,
    link: '/properties?property_type=farmhouse',
    color: 'bg-muted text-muted-foreground',
  },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-foreground">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find the perfect property type for your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link key={category.title} to={category.link}>
              <Card className="h-full text-center hover:shadow-card-hover transition-smooth group">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${category.color} mb-4 group-hover:scale-110 transition-smooth`}>
                    <category.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
