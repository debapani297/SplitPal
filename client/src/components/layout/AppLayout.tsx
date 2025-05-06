import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import { initializeDataIfEmpty } from "@/lib/sessionStorage";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Initialize session storage data if needed
  useEffect(() => {
    initializeDataIfEmpty();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
