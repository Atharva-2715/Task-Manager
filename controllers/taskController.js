const sanitizeHtml = require('sanitize-html');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');

const PAGE_SIZE = 5;

const recordAuditLog = async (action, taskId, updatedContent = null) => {
  await AuditLog.create({
    action,
    taskId,
    updatedContent,
  });
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchFilter = (searchTerm = '') => {
  const term = sanitizeHtml(searchTerm.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (!term) {
    return {};
  }

  const regex = new RegExp(escapeRegex(term), 'i');
  return {
    $or: [{ title: regex }, { description: regex }],
  };
};

exports.getTasks = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const filter = buildSearchFilter(req.query.search || '');

    const totalItems = await Task.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);
    const safePage = Math.min(page, totalPages);

    const tasks = await Task.find(filter)
      .sort({ id: 1 })
      .skip((safePage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    return res.json({
      data: tasks,
      pagination: {
        totalItems,
        currentPage: safePage,
        totalPages,
        pageSize: PAGE_SIZE,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const lastTask = await Task.findOne().sort({ id: -1 });
    const nextId = lastTask ? lastTask.id + 1 : 1;

    const newTask = await Task.create({
      id: nextId,
      title: req.body.title,
      description: req.body.description,
    });

    await recordAuditLog('Create Task', newTask.id, {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      createdAt: newTask.createdAt,
    });

    return res.status(201).json({ data: newTask });
  } catch (error) {
    return next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task identifier.' });
    }

    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const changes = {};

    if (req.body.title !== task.title) {
      changes.title = req.body.title;
      task.title = req.body.title;
    }

    if (req.body.description !== task.description) {
      changes.description = req.body.description;
      task.description = req.body.description;
    }

    await task.save();

    await recordAuditLog(
      'Update Task',
      task.id,
      Object.keys(changes).length ? changes : {}
    );

    return res.json({ data: task });
  } catch (error) {
    return next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task identifier.' });
    }

    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await task.deleteOne();

    await recordAuditLog('Delete Task', task.id, null);

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

