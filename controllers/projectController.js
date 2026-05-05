const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// POST /api/projects — Create a new project
exports.createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await project.populate('members.user', 'name email');

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// GET /api/projects — List all projects the user is a member of
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('members.user', 'name email')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    // Attach task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
        taskCounts.forEach((tc) => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return {
          ...project.toObject(),
          taskCounts: counts
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// GET /api/projects/:id — Get a single project
exports.getProject = async (req, res) => {
  try {
    // req.project is already set by projectRole middleware
    await req.project.populate('members.user', 'name email');
    await req.project.populate('owner', 'name email');

    res.json(req.project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// PUT /api/projects/:id — Update a project
exports.updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;

    req.project.name = name || req.project.name;
    if (description !== undefined) req.project.description = description;

    await req.project.save();
    await req.project.populate('members.user', 'name email');
    await req.project.populate('owner', 'name email');

    res.json(req.project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// DELETE /api/projects/:id — Delete a project and all its tasks
exports.deleteProject = async (req, res) => {
  try {
    // Delete all tasks in this project
    await Task.deleteMany({ project: req.project._id });

    await Project.findByIdAndDelete(req.project._id);

    res.json({ message: 'Project and all associated tasks deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// POST /api/projects/:id/members — Add a member by email
exports.addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, role } = req.body;

    // Find the user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Check if already a member
    const isMember = req.project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    req.project.members.push({
      user: userToAdd._id,
      role: role || 'member'
    });
    await req.project.save();
    await req.project.populate('members.user', 'name email');

    res.json(req.project);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
};

// DELETE /api/projects/:id/members/:userId — Remove a member
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot remove the project owner
    if (req.project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    // Cannot remove yourself if you're the only admin
    const admins = req.project.members.filter((m) => m.role === 'admin');
    if (admins.length === 1 && admins[0].user.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the only admin' });
    }

    req.project.members = req.project.members.filter(
      (m) => m.user.toString() !== userId
    );
    await req.project.save();
    await req.project.populate('members.user', 'name email');

    // Unassign any tasks assigned to the removed user in this project
    await Task.updateMany(
      { project: req.project._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    res.json(req.project);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
};
