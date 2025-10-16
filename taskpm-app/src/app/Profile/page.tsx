'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar/page';
import Projects from '../Dashboard/Projects';
import Tasks from '../Dashboard/Tasks';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
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

  const fetchUserProjects = async (userId: string) => {
    const { data } = await supabase
      .from('projects')
      .select('id, title, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setProjects(data || []);
  };

  const fetchUserTasks = async (userId: string) => {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    if (!projects?.length) return setTasks([]);

    const projectIds = projects.map((p) => p.id);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('id, title, status, due_date, project_id')
      .in('project_id', projectIds)
      .order('due_date', { ascending: true });

    setTasks(taskData || []);
  };

  useEffect(() => {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Unchecked runtime.lastError')
    ) {
      return;
    }
    originalError(...args);
  };

  return () => {
    console.error = originalError; 
  };
}, []);


  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push('/Login');
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

          <div className="profile-projects">
            <h1>Projects Given</h1>
            
            <Projects
              projects={projects}
              refreshProjects={() => fetchUserProjects(session?.user?.id)}
              session={session}
            />
          </div>

          <div className="profile-task">
            <h1>Tasks Given</h1>

            <Tasks
              tasks={tasks}
              projects={projects}
              session={session}
              refreshTasks={() => fetchUserTasks(session?.user?.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
