import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isVuEmail } from '@/lib/supabase';
import { useToast } from './use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Handle OTP verification
        if (event === 'SIGNED_IN') {
          // Check if user has a VU email
          if (session?.user && !isVuEmail(session.user.email || '')) {
            // Sign out users without VU email
            await supabase.auth.signOut();
            toast({
              title: 'Access Denied',
              description: 'Only VU email addresses are allowed.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login Successful',
              description: 'Welcome to VU Portal!',
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut: () => supabase.auth.signOut(),
  };
}