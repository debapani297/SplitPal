import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/types";
import { getCurrentUser, setCurrentUser, isLoggedIn, logoutUser } from "@/lib/sessionStorage";
import { useMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUserState] = useState("");
  const isMobile = useMobile();

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Use our logoutUser function to clear authentication
    logoutUser();
    setCurrentUserState(getCurrentUser());
    // Reload to trigger redirection
    window.location.href = "/login";
  };

  // Basic navigation items always available
  const baseNavItems = [
    { path: AppRoutes.DASHBOARD, label: "Dashboard", icon: "home" },
  ];
  
  // Navigation items that require authentication
  const authNavItems = [
    { path: AppRoutes.CREATE_ORDER, label: "Create Order", icon: "plus-circle" },
    { path: AppRoutes.VIEW_ORDERS, label: "View Orders", icon: "list-alt" },
    { path: AppRoutes.PAY_SUBORDERS, label: "Pay Suborders", icon: "credit-card" },
    // { path: AppRoutes.PAY_MAIN_ORDER, label: "Pay Main Order", icon: "dollar-sign" },
  ];
  
  // Show different nav items based on authentication state
  const navItems = isLoggedIn()
    ? [...baseNavItems, ...authNavItems]
    : baseNavItems;

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-5 flex justify-between items-center w-full md:hidden">
        <div className="flex items-center">
          <span className="text-primary font-bold text-2xl">SplitPal</span>
        </div>
        <button onClick={toggleSidebar} className="text-secondary">
          <Icon name="bars" className="text-xl" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`bg-white w-full md:w-64 md:min-h-screen shadow z-10 ${isMobile ? 'fixed inset-y-0 left-0' : ''} ${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="p-6">
          <h1 className="text-primary font-bold text-2xl">SplitPal</h1>
        </div>
        <div className="border-t border-gray-200">
          <nav className="py-4">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className={`flex items-center px-6 py-3 ${location === item.path ? 'bg-primary text-white' : 'text-secondary hover:bg-primary hover:text-white'}`}
              >
                <Icon name={item.icon} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 mt-auto p-4">
          {isLoggedIn() ? (
            // Logged in state - show user info and logout
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-secondary">
                  <Icon name="user" />
                </div>
                <span className="text-secondary ml-2">{currentUser}</span>
              </div>
              <Button 
                variant="ghost" 
                className="mt-2 text-sm text-red-500 hover:text-red-700 p-0"
                onClick={handleLogout}
              >
                <Icon name="sign-out-alt" className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            // Logged out state - show login button
            <Link href="/auth">
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Icon name="sign-in-alt" className="mr-1" /> Login / Sign Up
              </Button>
            </Link>
          )}
        </div>
      </aside>
      
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
