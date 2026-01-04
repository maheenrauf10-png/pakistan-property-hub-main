import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Heart, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-heading font-bold text-primary">Homes Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/properties" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            All Properties
          </Link>
          <Link to="/properties?listing_type=rent" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            For Rent
          </Link>
          <Link to="/properties?listing_type=sale" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            For Sale
          </Link>
          <Link to="/map" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Map Discovery
          </Link>
          <Link to="/price-checker" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth flex items-center gap-1">
            <Calculator className="h-3.5 w-3.5" />
            Price Checker
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/properties/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Property
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 space-y-2">
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              All Properties
            </Link>
            <Link
              to="/properties?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              For Rent
            </Link>
            <Link
              to="/properties?listing_type=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              For Sale
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              Map Discovery
            </Link>
            <Link
              to="/price-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Price Checker
            </Link>
            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-start" size="sm">
                    <Link to="/properties/new" onClick={() => setMobileMenuOpen(false)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Property
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start" size="sm">
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start" size="sm">
                    <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full" size="sm">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Login / Sign Up
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
