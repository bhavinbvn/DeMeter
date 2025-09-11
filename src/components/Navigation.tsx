import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthContext';
import { Sprout, BarChart3, History, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border agricultural-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">YieldSense</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-6">
                <Link 
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-[var(--transition-smooth)] ${
                    isActive('/dashboard') 
                      ? 'text-primary bg-primary-light' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/prediction"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-[var(--transition-smooth)] ${
                    isActive('/prediction') 
                      ? 'text-primary bg-primary-light' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Sprout className="h-4 w-4" />
                  <span>New Prediction</span>
                </Link>
                <Link 
                  to="/history"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-[var(--transition-smooth)] ${
                    isActive('/history') 
                      ? 'text-primary bg-primary-light' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;