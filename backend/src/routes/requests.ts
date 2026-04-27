import { Router, Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../db/supabase';

const router = Router();

const PA_NOTIFY_MANAGER  = process.env.POWER_AUTOMATE_NOTIFY_MANAGER;
const PA_NOTIFY_EMPLOYEE = process.env.POWER_AUTOMATE_NOTIFY_EMPLOYEE;

// Fire and forget — never block the main response for email failures
async function notifyManager(payload: {
  request_id: string;
  employee_name: string;
  employee_email: string;
  asset_name: string;
  reason: string;
  manager_email: string;
}) {
  if (!PA_NOTIFY_MANAGER) return;
  await axios.post(PA_NOTIFY_MANAGER, payload)
    .catch((e: Error) => console.error('Notify manager failed:', e.message));
}

async function notifyEmployee(payload: {
  employee_email: string;
  employee_name: string;
  asset_name: string;
  status: string;
}) {
  if (!PA_NOTIFY_EMPLOYEE) return;
  await axios.post(PA_NOTIFY_EMPLOYEE, payload)
    .catch((e: Error) => console.error('Notify employee failed:', e.message));
}

// GET /api/requests — all requests (manager/admin)
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

// GET /api/requests/mine?employee_id=xxx
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

// POST /api/requests — submit a new request
router.post('/', async (req: Request, res: Response) => {
  const { employee_id, asset_id, reason } = req.body;

  if (!employee_id || !asset_id) {
    return res.status(400).json({ error: 'employee_id and asset_id are required' });
  }

  // Check asset availability
  const { data: asset, error: assetErr } = await supabase
    .from('assets')
    .select('available, name')
    .eq('id', asset_id)
    .single();

  if (assetErr || !asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.available < 1) return res.status(409).json({ error: 'Asset not available' });

  // Fetch employee details for the email
  const { data: employee, error: empErr } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', employee_id)
    .single();

  if (empErr || !employee) return res.status(404).json({ error: 'Employee not found' });

  // Fetch a manager to notify — picks the first manager found
  const { data: managers } = await supabase
    .from('users')
    .select('email')
    .eq('role', 'manager')
    .limit(1);

  const { data: request, error } = await supabase
    .from('requests')
    .insert({ employee_id, asset_id, reason })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Send manager notification email
  if (managers && managers.length > 0) {
    notifyManager({
      request_id: request.id,
      employee_name: employee.name,
      employee_email: employee.email,
      asset_name: asset.name,
      reason: reason || 'No reason provided',
      manager_email: managers[0].email,
    });
  }

  return res.status(201).json(request);
});

// PATCH /api/requests/:id — approve, reject, or return
router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolved_by } = req.body;

  const validStatuses = ['approved', 'rejected', 'returned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('requests')
    .select(`
      *,
      asset:asset_id ( available, name ),
      employee:employee_id ( name, email )
    `)
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

  // Notify employee of status change (approved or rejected)
  if (status === 'approved' || status === 'rejected') {
    notifyEmployee({
      employee_email: existing.employee.email,
      employee_name: existing.employee.name,
      asset_name: existing.asset.name,
      status,
    });
  }

  return res.json(updated);
});

// DELETE /api/requests/all
router.delete('/all', async (_req: Request, res: Response) => {
  const { error } = await supabase
    .from('requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'All requests deleted' });
});

// DELETE /api/requests/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Request deleted' });
});

export default router;