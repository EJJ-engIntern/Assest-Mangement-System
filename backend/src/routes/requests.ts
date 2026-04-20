// import { Router, Request, Response } from 'express';
// import axios from 'axios';
// import { supabase } from '../db/supabase';

// const router = Router();

// const PA_WEBHOOK = process.env.POWER_AUTOMATE_WEBHOOK;

// // GET /api/requests — all requests (manager/admin view)
// router.get('/', async (_req: Request, res: Response) => {
//   const { data, error } = await supabase
//     .from('requests')
//     .select(`
//       *,
//       employee:employee_id ( id, name, email, department ),
//       asset:asset_id ( id, name, category )
//     `)
//     .order('requested_at', { ascending: false });

//   if (error) return res.status(500).json({ error: error.message });
//   return res.json(data);
// });

// // GET /api/requests/mine?employee_id=xxx — employee's own requests
// router.get('/mine', async (req: Request, res: Response) => {
//   const { employee_id } = req.query;
//   if (!employee_id) return res.status(400).json({ error: 'employee_id required' });

//   const { data, error } = await supabase
//     .from('requests')
//     .select(`
//       *,
//       asset:asset_id ( id, name, category )
//     `)
//     .eq('employee_id', employee_id)
//     .order('requested_at', { ascending: false });

//   if (error) return res.status(500).json({ error: error.message });
//   return res.json(data);
// });

// // POST /api/requests — submit a new request
// router.post('/', async (req: Request, res: Response) => {
//   const { employee_id, asset_id, reason } = req.body;

//   if (!employee_id || !asset_id) {
//     return res.status(400).json({ error: 'employee_id and asset_id are required' });
//   }

//   // Check availability
//   const { data: asset, error: assetErr } = await supabase
//     .from('assets')
//     .select('available, name')
//     .eq('id', asset_id)
//     .single();

//   if (assetErr || !asset) return res.status(404).json({ error: 'Asset not found' });
//   if (asset.available < 1) return res.status(409).json({ error: 'Asset not available' });

//   const { data: request, error } = await supabase
//     .from('requests')
//     .insert({ employee_id, asset_id, reason })
//     .select()
//     .single();

//   if (error) return res.status(500).json({ error: error.message });

//   // Trigger Power Automate approval flow
//   if (PA_WEBHOOK) {
//     await axios.post(PA_WEBHOOK, {
//       request_id: request.id,
//       employee_id,
//       asset_name: asset.name,
//       reason,
//     }).catch((e) => console.error('Power Automate trigger failed:', e.message));
//   }

//   return res.status(201).json(request);
// });

// // PATCH /api/requests/:id — approve, reject, or return
// router.patch('/:id', async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { status, resolved_by } = req.body;

//   const validStatuses = ['approved', 'rejected', 'returned'];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
//   }

//   // Fetch current request
//   const { data: existing, error: fetchErr } = await supabase
//     .from('requests')
//     .select('*, asset:asset_id(available)')
//     .eq('id', id)
//     .single();

//   if (fetchErr || !existing) return res.status(404).json({ error: 'Request not found' });

//   // Update request status
//   const { data: updated, error: updateErr } = await supabase
//     .from('requests')
//     .update({ status, resolved_by, resolved_at: new Date().toISOString() })
//     .eq('id', id)
//     .select()
//     .single();

//   if (updateErr) return res.status(500).json({ error: updateErr.message });

//   if (status === 'approved') {
//     // Decrement available count
//     await supabase
//       .from('assets')
//       .update({ available: existing.asset.available - 1 })
//       .eq('id', existing.asset_id);

//     // Create allocation record
//     await supabase.from('allocations').insert({
//       request_id: id,
//       employee_id: existing.employee_id,
//       asset_id: existing.asset_id,
//     });
//   }

//   if (status === 'returned') {
//     // Increment available count
//     await supabase
//       .from('assets')
//       .update({ available: existing.asset.available + 1 })
//       .eq('id', existing.asset_id);

//     // Mark allocation as returned
//     await supabase
//       .from('allocations')
//       .update({ returned_at: new Date().toISOString() })
//       .eq('request_id', id)
//       .is('returned_at', null);
//   }

//   return res.json(updated);
// });

// export default router;

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../db/supabase';

const router = Router();

const PA_WEBHOOK = process.env.POWER_AUTOMATE_WEBHOOK;

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      employee:employee_id ( id, name, email, department ),
      asset:asset_id ( id, name, category )
    `)
    .order('requested_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/mine', async (req: Request, res: Response) => {
  const { employee_id } = req.query;
  if (!employee_id) return res.status(400).json({ error: 'employee_id required' });

  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      asset:asset_id ( id, name, category )
    `)
    .eq('employee_id', employee_id)
    .order('requested_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/', async (req: Request, res: Response) => {
  const { employee_id, asset_id, reason } = req.body;

  if (!employee_id || !asset_id) {
    return res.status(400).json({ error: 'employee_id and asset_id are required' });
  }

  const { data: asset, error: assetErr } = await supabase
    .from('assets')
    .select('available, name')
    .eq('id', asset_id)
    .single();

  if (assetErr || !asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.available < 1) return res.status(409).json({ error: 'Asset not available' });

  const { data: request, error } = await supabase
    .from('requests')
    .insert({ employee_id, asset_id, reason })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (PA_WEBHOOK) {
    await axios.post(PA_WEBHOOK, {
      request_id: request.id,
      employee_id,
      asset_name: asset.name,
      reason,
    }).catch((e: Error) => console.error('Power Automate trigger failed:', e.message));
  }

  return res.status(201).json(request);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolved_by } = req.body;

  const validStatuses = ['approved', 'rejected', 'returned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('requests')
    .select('*, asset:asset_id(available)')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) return res.status(404).json({ error: 'Request not found' });

  const { data: updated, error: updateErr } = await supabase
    .from('requests')
    .update({ status, resolved_by, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  if (status === 'approved') {
    await supabase
      .from('assets')
      .update({ available: existing.asset.available - 1 })
      .eq('id', existing.asset_id);

    await supabase.from('allocations').insert({
      request_id: id,
      employee_id: existing.employee_id,
      asset_id: existing.asset_id,
    });
  }

  if (status === 'returned') {
    await supabase
      .from('assets')
      .update({ available: existing.asset.available + 1 })
      .eq('id', existing.asset_id);

    await supabase
      .from('allocations')
      .update({ returned_at: new Date().toISOString() })
      .eq('request_id', id)
      .is('returned_at', null);
  }

  return res.json(updated);
});

export default router;