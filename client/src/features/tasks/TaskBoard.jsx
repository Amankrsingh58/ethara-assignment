import TaskCard from './TaskCard';

const columns = [
  { key: 'todo', label: 'To Do', icon: '📋' },
  { key: 'in-progress', label: 'In Progress', icon: '🔄' },
  { key: 'done', label: 'Done', icon: '✅' },
];

const TaskBoard = ({ tasks = [], onEdit, onDelete, isAdmin }) => {
  return (
    <div className="task-board">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div className="task-column" key={col.key}>
            <div className="column-header">
              <span className="column-icon">{col.icon}</span>
              <h3 className="column-title">{col.label}</h3>
              <span className="column-count">{colTasks.length}</span>
            </div>
            <div className="column-tasks">
              {colTasks.length === 0 ? (
                <div className="column-empty">No tasks</div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
