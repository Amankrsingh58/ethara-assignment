const Project = require('../models/Project');

/**
 * Middleware factory that checks if the current user has one of the
 * specified roles in the target project.
 *
 * Looks for projectId in req.params.id or req.params.projectId.
 * Attaches the found project to req.project for downstream use.
 *
 * @param  {...string} roles - Allowed roles, e.g. 'admin', 'member'
 */
const projectRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required.' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      // Find the user's membership in this project
      const membership = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      if (!roles.includes(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action.' });
      }

      req.project = project;
      req.userRole = membership.role;
      next();
    } catch (error) {
      console.error('Project role middleware error:', error);
      return res.status(500).json({ message: 'Server error checking permissions.' });
    }
  };
};

module.exports = projectRole;
