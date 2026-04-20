// import { Router, Request, Response } from 'express';
// import { supabase } from '../db/supabase';

// const router = Router();

// // GET /api/assets — list all assets with available/used counts
// router.get('/', async (_req: Request, res: Response) => {
//   const { data, error } = await supabase
//     .from('assets')
//     .select('*')
//     .order('name');

//   if (error) return res.status(500).json({ error: error.message });
//   return res.json(data);
// });

// // POST /api/assets — create a new asset (admin only; auth enforced at middleware layer)
// router.post('/', async (req: Request, res: Response) => {
//   const { name, category, total_qty } = req.body;

//   if (!name || !category || !total_qty) {
//     return res.status(400).json({ error: 'name, category, and total_qty are required' });
//   }

//   const { data, error } = await supabase
//     .from('assets')
//     .insert({ name, category, total_qty, available: total_qty })
//     .select()
//     .single();

//   if (error) return res.status(500).json({ error: error.message });
//   return res.status(201).json(data);
// });

// // PATCH /api/assets/:id — update quantity (admin only)
// router.patch('/:id', async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { total_qty, available } = req.body;

//   const { data, error } = await supabase
//     .from('assets')
//     .update({ total_qty, available })
//     .eq('id', id)
//     .select()
//     .single();

//   if (error) return res.status(500).json({ error: error.message });
//   return res.json(data);
// });

// export default router;

import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, category, total_qty } = req.body;

  if (!name || !category || !total_qty) {
    return res.status(400).json({ error: 'name, category, and total_qty are required' });
  }

  const { data, error } = await supabase
    .from('assets')
    .insert({ name, category, total_qty, available: total_qty })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { total_qty, available } = req.body;

  const { data, error } = await supabase
    .from('assets')
    .update({ total_qty, available })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});


// DELETE /api/assets/all — wipe all assets (dev/admin only)
router.delete('/all', async (_req: Request, res: Response) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // deletes all rows

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'All assets deleted' });
});

export default router;