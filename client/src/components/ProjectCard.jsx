import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { taskCounts } = project;
  const totalTasks = taskCounts?.total || 0;
  const doneTasks = taskCounts?.done || 0;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
      <div className="project-card-header">
        <h3 className="project-card-name">{project.name}</h3>
        <span className="project-card-members">
          👥 {project.members?.length || 0}
        </span>
      </div>
      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}
      <div className="project-card-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{progress}% complete</span>
      </div>
      <div className="project-card-stats">
        <span className="mini-stat todo">📋 {taskCounts?.todo || 0}</span>
        <span className="mini-stat in-progress">🔄 {taskCounts?.['in-progress'] || 0}</span>
        <span className="mini-stat done">✅ {doneTasks}</span>
      </div>
    </div>
  );
};

export default ProjectCard;
