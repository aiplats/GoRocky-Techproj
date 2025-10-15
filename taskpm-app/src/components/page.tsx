'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/Login');
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="main-container">
        <div className="navbar-list">
            <h1>GoRocky</h1>
            
            <button style={{width: '100px', height: '30px'}}>Profile</button>
            <button
                style={{width: '100px', height: '30px'}}
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/Login');
                }}
                >
                  Logout
            </button>
        </div>
    </div>
  )
}

export default Navbar