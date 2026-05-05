import { useState } from 'react';
import { useGetProjectsQuery, useCreateProjectMutation } from './projectApi';
import ProjectCard from '../../components/ProjectCard';
import Modal from '../../components/Modal';

const ProjectsPage = () => {
  const { data: projects, isLoading, error } = useGetProjectsQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError('Project name is required'); return; }
    try {
      await createProject(formData).unwrap();
      setShowModal(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setFormError(err.data?.message || 'Failed to create project');
    }
  };

  if (isLoading) return <div className="page-loader"><div className="spinner-lg" /><p>Loading projects...</p></div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>
      {error && <div className="error-state"><p>Failed to load projects.</p></div>}
      {(!projects || projects.length === 0) && !error ? (
        <div className="empty-state-full">
          <div className="empty-icon">📁</div>
          <h2>No projects yet</h2>
          <p>Create your first project to start managing tasks.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">{projects?.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input id="project-name" type="text" placeholder="My Awesome Project" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="project-desc">Description (optional)</label>
            <textarea id="project-desc" placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
