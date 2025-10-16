'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface TasksProps {
  tasks: any[];
  projects: any[];
  session: any;
  refreshTasks: () => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, projects, session, refreshTasks }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskValues, setNewTaskValues] = useState({
    title: '',
    status: '',
    due_date: '',
  });

  // Handle new task
  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTaskValues((prev) => ({ ...prev, [name]: value }));
  };

  const saveNewTask = async () => {
    try {
      if (!session?.user) return console.error('No active session.');
      if (projects.length === 0) return console.warn('Create a project first.');

      const projectId = projects[0].id;
      const newTask = {
        title: newTaskValues.title || `New Task ${tasks.length + 1}`,
        status: newTaskValues.status || 'pending',
        due_date: newTaskValues.due_date || null,
        project_id: projectId,
      };

      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) throw error;

      await refreshTasks();
      setIsAddingTask(false);
      setNewTaskValues({ title: '', status: '', due_date: '' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Edit task
  const startEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditValues({
      title: task.title,
      status: task.status || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveTask = async (taskId: string) => {
    try {
      const formattedValues = {
        title: editValues.title,
        status: editValues.status,
        due_date: editValues.due_date || null,
      };
      const { error } = await supabase.from('tasks').update(formattedValues).eq('id', taskId);
      if (error) throw error;
      setEditingTaskId(null);
      setEditValues({});
      await refreshTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditValues({});
  };

  const removeTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      await refreshTasks();
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  return (
    <div className="tasks">
      <div className="section-header">
        <h2>Recent Tasks</h2>
        {!isAddingTask && <button onClick={() => setIsAddingTask(true)}>New</button>}
      </div>

      {isAddingTask && (
        <div className="new-task-form">
          <input
            type="text"
            name="title"
            value={newTaskValues.title}
            onChange={handleNewTaskChange}
            placeholder="Task title"
          />
          <select name="status" value={newTaskValues.status} onChange={handleNewTaskChange}>
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            name="due_date"
            value={newTaskValues.due_date}
            onChange={handleNewTaskChange}
          />
          <button onClick={saveNewTask}>Save</button>
          <button onClick={() => setIsAddingTask(false)}>Cancel</button>
        </div>
      )}

      <ul className="task-lists">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="task-container">
              {editingTaskId === task.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    name="title"
                    value={editValues.title}
                    onChange={handleEditChange}
                    placeholder="Task title"
                  />
                  <select name="status" value={editValues.status} onChange={handleEditChange}>
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input
                    type="date"
                    name="due_date"
                    value={editValues.due_date}
                    onChange={handleEditChange}
                  />
                  <button onClick={() => saveTask(task.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="task-details-container">
                  <div className="task-details">
                    <li>
                      <strong>{task.title}</strong> — {task.status || 'No status'}
                      <br />
                      <small>Due: {task.due_date || 'No due date'}</small>
                    </li>
                  </div>
                  <div className="task-action">
                    <button onClick={() => startEdit(task)}>Edit</button>
                    <button onClick={() => removeTask(task.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No tasks found.</p>
        )}
      </ul>
    </div>
  );
};

export default Tasks;
