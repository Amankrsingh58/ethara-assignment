const router = require('express').Router();
const auth = require('../middleware/auth');
const projectRole = require('../middleware/projectRole');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { projectValidation, addMemberValidation } = require('../validators');

// All routes require authentication
router.use(auth);

router.post('/', projectValidation, createProject);
router.get('/', getProjects);

router.get('/:id', projectRole('admin', 'member'), getProject);
router.put('/:id', projectRole('admin'), projectValidation, updateProject);
router.delete('/:id', projectRole('admin'), deleteProject);

router.post('/:id/members', projectRole('admin'), addMemberValidation, addMember);
router.delete('/:id/members/:userId', projectRole('admin'), removeMember);

// Project-scoped task routes
const { createTask, getProjectTasks } = require('../controllers/taskController');
const { taskValidation } = require('../validators');

router.post('/:projectId/tasks', projectRole('admin'), taskValidation, createTask);
router.get('/:projectId/tasks', projectRole('admin', 'member'), getProjectTasks);

module.exports = router;
