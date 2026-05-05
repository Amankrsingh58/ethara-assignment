import { useGetDashboardQuery } from './dashboardApi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';

const DashboardPage = () => {
  const { data, isLoading, error } = useGetDashboardQuery(undefined, {
    pollingInterval: 30000,
  });
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="spinner-lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const { stats, recentTasks, overdueTasks } = data || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          + New Project
        </button>
      </div>

      <div className="stats-grid">
        <StatCard icon="📁" label="Total Projects" value={stats?.totalProjects || 0} color="blue" />
        <StatCard icon="📋" label="Total Tasks" value={stats?.totalTasks || 0} color="violet" />
        <StatCard icon="🔄" label="In Progress" value={stats?.inProgress || 0} color="amber" />
        <StatCard icon="✅" label="Completed" value={stats?.done || 0} color="green" />
        <StatCard icon="⚠️" label="Overdue" value={stats?.overdue || 0} color="red" />
        <StatCard icon="📝" label="To Do" value={stats?.todo || 0} color="slate" />
      </div>

      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="dash-card-body">
            {!recentTasks || recentTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet. Create a project to get started!</p>
              </div>
            ) : (
              <div className="task-list">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="task-list-item"
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  >
                    <div className="task-list-info">
                      <span className={`status-dot status-${task.status}`} />
                      <div>
                        <span className="task-list-title">{task.title}</span>
                        <span className="task-list-project">{task.project?.name}</span>
                      </div>
                    </div>
                    <div className="task-list-meta">
                      {task.assignedTo && (
                        <span className="task-list-assignee">
                          {task.assignedTo.name}
                        </span>
                      )}
                      <span className="task-list-date">{formatDate(task.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="dash-card dash-card-danger">
          <div className="dash-card-header">
            <h2>⚠️ Overdue Tasks</h2>
          </div>
          <div className="dash-card-body">
            {!overdueTasks || overdueTasks.length === 0 ? (
              <div className="empty-state">
                <p>🎉 No overdue tasks! You're on track.</p>
              </div>
            ) : (
              <div className="task-list">
                {overdueTasks.map((task) => (
                  <div
                    key={task._id}
                    className="task-list-item task-overdue-item"
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  >
                    <div className="task-list-info">
                      <span className="status-dot status-overdue" />
                      <div>
                        <span className="task-list-title">{task.title}</span>
                        <span className="task-list-project">{task.project?.name}</span>
                      </div>
                    </div>
                    <span className="task-due-badge">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
