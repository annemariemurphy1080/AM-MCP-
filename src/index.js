const express = require('express');
const app = express();
app.use(express.json());

const tasks = [];
const projects = [];

app.get('/tasks', (req, res) => {
  const { status, priority, assignee, overdue } = req.query;
  let result = tasks;
  if (status) result = result.filter(t => t.status === status);
  if (priority) result = result.filter(t => t.priority === priority);
  if (assignee) result = result.filter(t => t.assignee === assignee);
  if (overdue === 'true') {
    const now = new Date();
    result = result.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
  }
  res.json(result);
});

app.post('/tasks', (req, res) => {
  const { dueDate } = req.body;
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'dueDate must be a valid ISO 8601 date string' });
  }
  const task = { id: Date.now(), createdAt: new Date(), status: 'open', ...req.body };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  const { dueDate } = req.body;
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'dueDate must be a valid ISO 8601 date string' });
  }
  tasks[idx] = { ...tasks[idx], ...req.body, updatedAt: new Date() };
  res.json(tasks[idx]);
});

app.delete('/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  res.status(204).send();
});

app.get('/projects', (req, res) => res.json(projects));

app.post('/projects', (req, res) => {
  const project = { id: Date.now(), createdAt: new Date(), ...req.body };
  projects.push(project);
  res.status(201).json(project);
});

app.listen(3000, () => console.log('TaskFlow API running on port 3000'));
