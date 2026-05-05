const TaskCard = ({ task, onEdit, onDelete, isAdmin }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`task-card ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-top">
        <span className={`priority-badge ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {isAdmin && (
          <div className="task-actions">
            <button
              className="task-action-btn"
              onClick={() => onEdit(task)}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="task-action-btn task-delete-btn"
              onClick={() => onDelete(task._id)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      <h4 className="task-card-title">{task.title}</h4>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}
      <div className="task-card-footer">
        {task.assignedTo && (
          <div className="task-assignee">
            <span className="assignee-avatar">
              {task.assignedTo.name?.charAt(0)?.toUpperCase()}
            </span>
            <span className="assignee-name">{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <span className={`task-due ${isOverdue ? 'due-overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>
      {!isAdmin && task.status !== 'done' && (
        <button
          className="task-status-btn"
          onClick={() => onEdit(task)}
          title="Update status"
        >
          Update Status
        </button>
      )}
    </div>
  );
};

export default TaskCard;
