import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// POST /api/auth/login
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
    return res.status(401).json({ error: 'This account has no password set. Please contact an admin.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Return user without password_hash
  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

export default router;