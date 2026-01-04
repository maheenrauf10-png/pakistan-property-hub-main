import { Link } from 'react-router-dom';
import { CITIES } from '@/lib/constants';

const cityImages: Record<string, string> = {
  Karachi: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&h=300&fit=crop',
  Lahore: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
  Islamabad: 'https://images.unsplash.com/photo-1570068674461-a6c6c6e3c06d?w=400&h=300&fit=crop',
  Rawalpindi: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400&h=300&fit=crop',
  Faisalabad: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&h=300&fit=crop',
  Multan: 'https://images.unsplash.com/photo-1565022536102-f7645c84354a?w=400&h=300&fit=crop',
  Peshawar: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
  Quetta: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
  Gujranwala: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
  Sialkot: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop',
};

const CityShowcase = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-foreground">Explore Properties by City</h2>
          <p className="mt-2 text-muted-foreground">
            Find your next property in Pakistan's major cities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city}
              to={`/properties?city=${city}`}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-smooth"
            >
              <img
                src={cityImages[city]}
                alt={city}
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-heading font-semibold text-primary-foreground">{city}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityShowcase;
