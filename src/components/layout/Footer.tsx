import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { CITIES } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              <span className="text-xl font-heading font-bold">Homes Hub</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Pakistan's trusted property marketplace. Find your dream home, commercial space, 
              or investment opportunity across 10 major cities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?listing_type=rent" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/properties?listing_type=sale" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?listing_type=land" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Land & Plots
                </Link>
              </li>
              <li>
                <Link to="/properties/new" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Popular Cities</h3>
            <ul className="space-y-2">
              {CITIES.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link
                    to={`/properties?city=${city}`}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
                  >
                    Properties in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                Blue Area, Islamabad, Pakistan
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 flex-shrink-0" />
                +92 51 1234567
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 flex-shrink-0" />
                info@homeshub.pk
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Homes Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
