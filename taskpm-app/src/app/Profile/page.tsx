'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar/page';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) console.error('Profile error:', error);
    else setProfile(data);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push('/Login'); // redirect if not logged in
      } else {
        setSession(data.session);
        await fetchUserProfile(data.session.user.id);
      }

      setLoading(false);
    };

    getSession();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="main-container">
    <Navbar />
      <div className="subcontainer">
        <h1>Welcome to Profile, {profile?.full_name || 'User'}!</h1>

        <div className="profile-container">
            <h1>Profile avatar goes here</h1>
            <h2>{profile?.full_name || 'User'}</h2>
        </div>
      </div>
    </div>
  );
};

export default Profile;
