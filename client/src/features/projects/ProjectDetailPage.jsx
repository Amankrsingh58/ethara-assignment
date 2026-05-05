import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetProjectQuery, useDeleteProjectMutation, useAddMemberMutation, useRemoveMemberMutation } from './projectApi';
import { useGetProjectTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../tasks/taskApi';
import TaskBoard from '../tasks/TaskBoard';
import Modal from '../../components/Modal';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { data: project, isLoading: projLoading } = useGetProjectQuery(id);
  const { data: tasks, isLoading: tasksLoading } = useGetProjectTasksQuery(id);
  const [deleteProject] = useDeleteProjectMutation();
  const [addMember] = useAddMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [formError, setFormError] = useState('');

  const userRole = project?.members?.find(m => m.user?._id === currentUser?._id)?.role;
  const isAdmin = userRole === 'admin';

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
    setFormError('');
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      priority: task.priority, status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || ''
    });
    setFormError('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingTask) {
        await updateTask({ id: editingTask._id, ...taskForm, assignedTo: taskForm.assignedTo || null, dueDate: taskForm.dueDate || null }).unwrap();
      } else {
        await createTask({ projectId: id, ...taskForm, assignedTo: taskForm.assignedTo || null, dueDate: taskForm.dueDate || null }).unwrap();
      }
      setShowTaskModal(false);
    } catch (err) { setFormError(err.data?.message || 'Failed to save task'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try { await deleteTask(taskId).unwrap(); } catch {}
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await addMember({ projectId: id, email: memberEmail }).unwrap();
      setMemberEmail('');
      setShowMemberModal(false);
    } catch (err) { setFormError(err.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member?')) {
      try { await removeMember({ projectId: id, userId }).unwrap(); } catch {}
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Delete this project and ALL its tasks? This cannot be undone.')) {
      try { await deleteProject(id).unwrap(); navigate('/projects'); } catch {}
    }
  };

  if (projLoading || tasksLoading) return <div className="page-loader"><div className="spinner-lg" /><p>Loading project...</p></div>;
  if (!project) return <div className="error-state"><p>Project not found.</p><button className="btn btn-ghost" onClick={() => navigate('/projects')}>← Back</button></div>;

  return (
    <div className="project-detail-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
          <div>
            <h1>{project.name}</h1>
            {project.description && <p className="project-desc-text">{project.description}</p>}
          </div>
        </div>
        <div className="page-header-actions">
          {isAdmin && <button className="btn btn-primary" onClick={openCreateTask}>+ Add Task</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑️ Delete</button>}
        </div>
      </div>

      {/* Members Section */}
      <div className="members-section">
        <div className="members-header">
          <h2>Team Members ({project.members?.length || 0})</h2>
          {isAdmin && <button className="btn btn-outline btn-sm" onClick={() => { setFormError(''); setShowMemberModal(true); }}>+ Add Member</button>}
        </div>
        <div className="members-list">
          {project.members?.map((m) => (
            <div key={m.user?._id} className="member-chip">
              <span className="member-avatar">{m.user?.name?.charAt(0)?.toUpperCase()}</span>
              <span className="member-name">{m.user?.name}</span>
              <span className={`role-badge role-${m.role}`}>{m.role}</span>
              {isAdmin && m.user?._id !== currentUser?._id && (
                <button className="member-remove" onClick={() => handleRemoveMember(m.user?._id)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Board */}
      <TaskBoard tasks={tasks || []} onEdit={openEditTask} onDelete={handleDeleteTask} isAdmin={isAdmin} />

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleTaskSubmit} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          {(isAdmin || !editingTask) && (
            <>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
              </div>
            </>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            {isAdmin && (
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}
          </div>
          {isAdmin && (
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creatingTask}>{editingTask ? 'Update' : 'Create'} Task</button>
          </div>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="member@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required autoFocus />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
