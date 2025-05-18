import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppRoutes } from "@/types";
import { isLoggedIn } from "@/lib/sessionStorage";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn()) {
      navigate(AppRoutes.DASHBOARD);
    }
  }, [navigate]);
  
  const handleAuthSuccess = () => {
    navigate(AppRoutes.DASHBOARD);
  };
  
  return (
    <>
      <PageHeader 
        title="Welcome to SplitPal" 
        description="Log in or create a new account to start managing your rent payments"
      />
      
      <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Tabs defaultValue="login" className="w-full max-w-md mx-auto" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLoginSuccess={handleAuthSuccess} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignupSuccess={handleAuthSuccess} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:block bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-lg">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-secondary">Simplify Rent Payments</h2>
            <p className="text-secondary/80">
              SplitPal makes it easy for roommates to split and manage their rent payments.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-secondary">Split Rent Easily</h3>
                  <p className="text-sm text-secondary/70">Create orders and split them between your roommates</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-secondary">Track Payments</h3>
                  <p className="text-sm text-secondary/70">See who has paid and who still needs to pay</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-secondary">Secure Payments</h3>
                  <p className="text-sm text-secondary/70">Make secure payments via PayPal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}