const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/dashboard — Aggregated stats for the current user
exports.getDashboard = async (req, res) => {
  try {
    // Get all projects the user is a member of
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map((p) => p._id);

    // Total task counts by status across all user's projects
    const statusCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalProjects: projects.length,
      totalTasks: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0
    };

    statusCounts.forEach((sc) => {
      stats.totalTasks += sc.count;
      if (sc._id === 'todo') stats.todo = sc.count;
      if (sc._id === 'in-progress') stats.inProgress = sc.count;
      if (sc._id === 'done') stats.done = sc.count;
    });

    // Overdue tasks (past due date, not done)
    const overdueCount = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });
    stats.overdue = overdueCount;

    // Recent tasks assigned to user
    const recentTasks = await Task.find({
      project: { $in: projectIds }
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10);

    // My assigned tasks that are overdue
    const overdueTasks = await Task.find({
      assignedTo: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })
      .populate('project', 'name')
      .sort({ dueDate: 1 })
      .limit(5);

    res.json({
      stats,
      recentTasks,
      overdueTasks
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
};
