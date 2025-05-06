import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppRoutes } from "@/types";
import { getCurrentUser } from "@/lib/sessionStorage";
import LoginForm from "@/components/auth/LoginForm";
import PageHeader from "@/components/layout/PageHeader";

export default function Login() {
  const [, navigate] = useLocation();
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser !== "default@example.com") {
      navigate(AppRoutes.DASHBOARD);
    }
  }, [navigate]);
  
  const handleLoginSuccess = () => {
    navigate(AppRoutes.DASHBOARD);
  };
  
  return (
    <>
      <PageHeader 
        title="Login" 
        description="Log in to manage your rent payments"
      />
      
      <div className="mt-8">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </>
  );
}