const router = require('express').Router();
const auth = require('../middleware/auth');
const projectRole = require('../middleware/projectRole');
const {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { taskValidation } = require('../validators');

// All routes require authentication
router.use(auth);

// My tasks (must come before /:id routes)
router.get('/my', getMyTasks);

// Task CRUD
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
