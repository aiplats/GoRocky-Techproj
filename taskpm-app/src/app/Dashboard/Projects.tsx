'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ProjectsProps {
  projects: any[];
  refreshProjects: () => void;
  session?: any;
}

const Projects: React.FC<ProjectsProps> = ({ projects, refreshProjects, session }) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
  });

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    title: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingProjectId) {
      setEditValues((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveNewProject = async () => {
    try {
      if (!session?.user) return console.error('No user session.');
      if (!newProject.title.trim()) return console.warn('Project title is required.');

      const { error } = await supabase.from('projects').insert([
        {
          title: newProject.title,
          description: newProject.description || '',
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;

      console.log('✅ Project added');
      await refreshProjects();
      setNewProject({ title: '', description: '' });
      setIsAddingProject(false);
    } catch (error) {
      console.error('❌ Error adding project:', error);
    }
  };

  const startEdit = (project: any) => {
    setEditingProjectId(project.id);
    setEditValues({
      title: project.title,
      description: project.description,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: editValues.title,
          description: editValues.description,
        })
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Project updated');
      setEditingProjectId(null);
      setEditValues({ title: '', description: '' });
      await refreshProjects();
    } catch (error) {
      console.error('❌ Error updating project:', error);
    }
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setEditValues({ title: '', description: '' });
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;

      console.log('✅ Project deleted');
      await refreshProjects();
    } catch (error) {
      console.error('❌ Error deleting project:', error);
    }
  };

  return (
    <div className="projects">
      <div className="section-header">
        <h2>My Projects</h2>
        {!isAddingProject && <button onClick={() => setIsAddingProject(true)}>New</button>}
      </div>

      {/* 🔹 New Project Form */}
      {isAddingProject && (
        <div className="new-project-form">
          <input
            type="text"
            name="title"
            value={newProject.title}
            onChange={handleChange}
            placeholder="Project title"
          />
          <textarea
            name="description"
            value={newProject.description}
            onChange={handleChange}
            placeholder="Project description"
          />
          <div className="form-buttons">
            <button onClick={saveNewProject}>Save</button>
            <button onClick={() => setIsAddingProject(false)}>Cancel</button>
          </div>
        </div>
      )}

      <ul className="project-lists">
        {projects.length > 0 ? (
          projects.map((project) => (
            <li key={project.id} className="project-item">
              {editingProjectId === project.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    name="title"
                    value={editValues.title}
                    onChange={handleChange}
                    placeholder="Project title"
                  />
                  <textarea
                    name="description"
                    value={editValues.description}
                    onChange={handleChange}
                    placeholder="Project description"
                  />
                  <div className="form-buttons">
                    <button onClick={() => saveEdit(project.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="project-details-container">
                  <div className="project-details">
                    <strong>{project.title}</strong>
                    <p>{project.description || 'No description provided'}</p>
                    <small>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </small>
                  </div>
                  <div className="project-actions">
                    <button onClick={() => startEdit(project)}>Edit</button>
                    <button onClick={() => deleteProject(project.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </ul>
    </div>
  );
};

export default Projects;
