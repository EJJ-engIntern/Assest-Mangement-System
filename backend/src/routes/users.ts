import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// GET /api/users
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, department')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// POST /api/users — store password as plain text in password_hash column
router.post('/', async (req: Request, res: Response) => {
  const { name, email, role, department, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, role: role || 'employee', department, password_hash: password })
    .select('id, name, email, role, department')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// DELETE /api/users/all
router.delete('/all', async (_req: Request, res: Response) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'All users deleted' });
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'User deleted' });
});

export default router;