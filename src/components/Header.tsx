import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthContext';
import { Sprout, BarChart3, History, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";

interface HeaderProps {
  pageName: string;
  userImage?: string;
  userName: string;
}

export const Header = ({ pageName, userImage, userName }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card border-b border-border agricultural-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side with logo and page name */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">Demeter</span>
            </Link>
            <h2 className="text-1xl font-bold">{pageName}</h2>
          </div>

          {/* Right side with profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{userName[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{userName.toLowerCase()}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};