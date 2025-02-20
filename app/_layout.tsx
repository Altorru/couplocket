import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js'
import { router, Slot } from 'expo-router'
import { supabase } from '../src/config/supabase'

const Layout = () => {
    const [session, setSession] = useState<Session | null>(null)

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
        })
    
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
        })
      }, [])

    useEffect(() => {
        if (session) {
            router.push('/(app)/home');
        }
    }, [session, router]);

    return <Slot />;
};

export default Layout;