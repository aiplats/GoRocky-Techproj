'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/page';

export default function DashboardPage() {
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
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-subcontainer">
        <h1>Welcome to DashBoard</h1>

        <div className="dashboard-lists">
          <div className="projects">
            <h2>My Projects</h2>
            <button>Manage</button>

            <div className="project-lists">
              <li>Projects go here</li>
            </div>
          </div>
          <div className="tasks">
            <h2>Recent Tasks</h2>
            <button>View All</button>

            <div className="task-lists">
              <li>Tasks go here</li>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
