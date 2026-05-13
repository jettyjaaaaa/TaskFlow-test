import express from 'express';
import supabase from '../lib/supabase.js';

const router = express.Router();

// Get all tasks with assignees (for current user or admin)
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, search_scope = 'summary', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          id,
          user_id,
          users (id, name, avatar_url, email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalizedSearch = search?.toLowerCase().trim();
    const assignedUserId = req.query.assigned_user_id ? Number(req.query.assigned_user_id) : null;

    const filtered = (tasks || []).filter((task) => {
      const assignees = task.task_assignments?.map((assignment) => assignment.users).filter(Boolean) || [];
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      const matchesAssignee = !assignedUserId || task.task_assignments?.some((assignment) => assignment.user_id === assignedUserId);

      if (!normalizedSearch) {
        return matchesStatus && matchesPriority && matchesAssignee;
      }

      const summaryHaystack = [task.title, task.priority, task.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const fullHaystack = [
        task.title,
        task.description,
        task.project_name,
        task.tag,
        task.priority,
        task.status,
        task.due_date,
        ...assignees.map((assignee) => assignee.name),
        ...assignees.map((assignee) => assignee.email)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const haystack = search_scope === 'full' ? fullHaystack : summaryHaystack;

      return matchesStatus && matchesPriority && matchesAssignee && haystack.includes(normalizedSearch);
    });

    const pagedTasks = filtered.slice(offset, offset + Number(limit));

    res.json({
      data: pagedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          id,
          user_id,
          users (id, name, avatar_url, email)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, project_name, tag, priority, status, progress, due_date, assignee_ids } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        project_name,
        tag,
        priority,
        status: status || 'To Do',
        progress: progress || 0,
        due_date,
        created_by: req.user?.id || null
      })
      .select()
      .single();

    if (error) throw error;

    // Add assignees
    if (assignee_ids && assignee_ids.length > 0) {
      const assignments = assignee_ids.map(user_id => ({
        task_id: task.id,
        user_id
      }));

      const { error: assignError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignError) throw assignError;
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, progress, priority, due_date, assignee_ids } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        status,
        progress,
        priority,
        due_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Update assignees if provided
    if (assignee_ids) {
      // Delete existing assignments
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', req.params.id);

      // Add new assignments
      if (assignee_ids.length > 0) {
        const assignments = assignee_ids.map(user_id => ({
          task_id: req.params.id,
          user_id
        }));

        await supabase
          .from('task_assignments')
          .insert(assignments);
      }
    }

    // Return full task with assignments
    const { data: fullTask, error: fullError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          id,
          user_id,
          users (id, name, avatar_url, email)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (fullError) throw fullError;

    res.json(fullTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    // Delete assignments first
    await supabase
      .from('task_assignments')
      .delete()
      .eq('task_id', req.params.id);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
