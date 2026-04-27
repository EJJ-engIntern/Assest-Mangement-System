import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// POST /api/auth/login — plain text password comparison
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, department, password_hash')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.password_hash) {
    return res.status(401).json({ error: 'No password set for this account. Contact an admin.' });
  }

  // Plain text comparison
  if (password !== user.password_hash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

export default router;  