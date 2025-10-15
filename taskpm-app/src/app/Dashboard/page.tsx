'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/page';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  // ✅ Check session
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

  // ✅ Fetch user's profile
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) console.error('Profile error:', error);
    else setProfile(data);
  };

  // ✅ Fetch user's tasks
  const fetchUserTasks = async (userId: string) => {
    try {
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

      if (projectError) throw projectError;
      if (!projects || projects.length === 0) {
        setTasks([]);
        return;
      }

      const projectIds = projects.map((p) => p.id);

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status, due_date, project_id')
        .in('project_id', projectIds)
        .order('due_date', { ascending: true });

      if (taskError) throw taskError;

      setTasks(taskData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // ✅ Run once session is ready
  useEffect(() => {
    if (session?.user) {
      fetchUserProfile(session.user.id);
      fetchUserTasks(session.user.id);
    }
  }, [session]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-subcontainer">
        <h1>Welcome to Dashboard, {profile?.full_name || 'User'}</h1>

        <div className="dashboard-lists">
          <div className="projects">
            <h2>My Projects</h2>
            <button>Manage</button>
            <ul className="project-lists">
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <li key={proj.id}>
                    <strong>{proj.title}</strong>
                    <small>{proj.description}</small>
                    <br />
                    <br />
                  </li>
                ))
              ) : (
                <p>No projects found.</p>
              )}
            </ul>
          </div>

          <div className="tasks">
            <h2>Recent Tasks</h2>
            <button>View All</button>

            <ul className="task-lists">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong> — {task.status || 'No status'} <br />
                    <small>Due: {task.due_date || 'No due date'}</small>
                    <br />
                    <br />
                  </li>                  
                ))
              ) : (
                <p>No tasks found.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
