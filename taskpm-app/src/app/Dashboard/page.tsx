'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/Navbar/page';
import Projects from './Projects';
import Tasks from './Tasks';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push('/Login');
      else setSession(data.session);
      setLoading(false);
    };
    getSession();
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
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
    if (session?.user) {
      fetchUserProfile(session.user.id);
      fetchUserProjects(session.user.id);
      fetchUserTasks(session.user.id);
    }
  }, [session]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="main-container">
      <Navbar />
      <div className="subcontainer">
        <h1>Welcome to Dashboard, {profile?.full_name || 'User'}!</h1>

        <div className="dashboard-lists">
          <Projects
            projects={projects}
            refreshProjects={() => fetchUserProjects(session?.user?.id)}
            session={session}
          />
          <Tasks
            tasks={tasks}
            projects={projects}
            session={session}
            refreshTasks={() => fetchUserTasks(session?.user?.id)}
          />
        </div>
      </div>
    </div>
  );
}
