'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'TECHNICAL_TEAM' | 'TECHNICIAN' | 'INVENTORY' | 'ACCOUNTS' | 'CUSTOMER';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (mounted) setUser(session.user);
          
          // Fetch profile for role
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data && mounted) {
            setProfile(data as UserProfile);
          } else if (mounted) {
            // Fallback if profile doesn't exist yet, but user is logged in
            setProfile({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || null,
              role: (session.user.user_metadata?.role as UserRole) || 'CUSTOMER',
            });
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchUser();
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
