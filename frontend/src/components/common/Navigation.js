import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, User } from 'lucide-react';

const menuItems = [
  { text: 'Home', path: '/' },
  { text: 'Project Documents', path: '/project-documents' },
  { text: 'Search Reports', path: '/search' },
  { text: 'Contacts', path: '/contacts' },
];

const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black border-b border-black z-50">
        <div className="flex items-center justify-between px-0.5 h-16 relative">
          {/* Mobile Logo (left) */}
          <div className="flex items-center flex-shrink-0">
            <RouterLink to="/" className="flex items-center no-underline">
              <img src="/staticfiles/PIPE-Logo.png" alt="PIPE Logo" className="h-20 w-auto object-contain" />
            </RouterLink>
          </div>

          {/* Mobile Hamburger (center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden z-10">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-15 h-15" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 border-b flex flex-col items-start">
                    <img src="/staticfiles/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto object-contain mb-2" />
                    <span className="text-left text-sm text-zinc-400 italic font-medium">"Streamline the report. Elevate the result."</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ul className="flex flex-col gap-y-1 mt-2">
                      {menuItems.map((item) => (
                        <li key={item.text}>
                          <RouterLink
                            to={item.path}
                            className="block px-6 py-2 rounded hover:bg-muted transition-colors text-black font-medium"
                            onClick={() => setDrawerOpen(false)}
                          >
                            {item.text}
                          </RouterLink>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t mt-2" />
                    {isAuthenticated ? (
                      <Button variant="ghost" className="w-full justify-start px-6 py-2 text-black font-medium" onClick={handleLogout}>
                        Logout
                      </Button>
                    ) : (
                      <>
                        <RouterLink to="/login" className="block px-6 py-2 rounded hover:bg-muted transition-colors text-black font-medium" onClick={() => setDrawerOpen(false)}>
                          Login
                        </RouterLink>
                        <RouterLink to="/signup" className="block px-6 py-2 rounded hover:bg-muted transition-colors text-black font-medium" onClick={() => setDrawerOpen(false)}>
                          Sign Up
                        </RouterLink>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Nav Links and Profile (right) */}
          <div className="flex-1 flex items-center justify-end gap-x-6">
            <div className="hidden md:flex items-center gap-x-6">
              {menuItems.map((item) => (
                <RouterLink
                  key={item.text}
                  to={item.path}
                  className="text-white font-medium hover:underline underline-offset-4 transition-colors"
                >
                  {item.text}
                </RouterLink>
              ))}
            </div>
            {/* User/Profile or Auth Buttons */}
            <div className="flex items-center gap-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 border border-white rounded-full px-3 py-1 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-white font-medium text-base">{user?.first_name || user?.username || 'User'}</span>
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <RouterLink to="/profile">Profile</RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/settings">Settings</RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex gap-x-2">
                  <Button asChild variant="ghost" className="text-white">
                    <RouterLink to="/login">Login</RouterLink>
                  </Button>
                  <Button asChild variant="ghost" className="text-white">
                    <RouterLink to="/signup">Sign Up</RouterLink>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navigation; 