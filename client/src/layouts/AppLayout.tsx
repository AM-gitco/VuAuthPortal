import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Redirect, useLocation } from 'wouter';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user && user.role !== 'admin' && (!user.degreeProgram || !user.subjects?.length) && !location.endsWith('/setup-profile')) {
      navigate('/dashboard/setup-profile');
    }
  }, [user, location, navigate]);

  // Redirect to auth if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we should hide the sidebar on this route
  const hideSidebarRoutes = ['/dashboard/setup-profile'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => location.endsWith(route));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {!shouldHideSidebar && <Sidebar user={user} />}
      <main className={`flex-1 ${!shouldHideSidebar ? 'ml-64' : ''} relative`}>
        {/* Theme toggle positioned in the top-right corner */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}