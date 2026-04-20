import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, department')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, email, role, department } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, role: role || 'employee', department })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

export default router;