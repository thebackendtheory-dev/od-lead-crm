import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not fully set in environment variables.');
      return null;
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set cookie for 90 days
    const token = Buffer.from(username).toString('base64'); // Simple token for demo, in prod use JWT
    res.cookie('admin_session', token, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  const session = req.cookies.admin_session;
  if (session) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConfigured: !!getSupabase() });
});

app.get('/api/leads', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  
  const leads = data.map((row: any) => ({
    id: row.id,
    clientName: row.client_name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    service: row.service,
    customService: row.custom_service,
    budget: Number(row.budget),
    stage: row.stage,
    assignedTo: row.assigned_to,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    meetingDate: row.meeting_date || null,
    notes: row.notes || [],
    tasks: row.tasks || [],
    activities: row.activities || []
  }));
  res.json(leads);
});

app.post('/api/leads', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json(req.body);
  
  const lead = req.body;
  const dbData = {
    id: lead.id,
    client_name: lead.clientName,
    company_name: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    service: lead.service,
    custom_service: lead.customService,
    budget: lead.budget,
    stage: lead.stage,
    assigned_to: lead.assignedTo,
    priority: lead.priority,
    created_at: lead.createdAt || new Date().toISOString(),
    updated_at: lead.updatedAt || new Date().toISOString(),
    meeting_date: lead.meetingDate || null,
    notes: lead.notes || [],
    tasks: lead.tasks || [],
    activities: lead.activities || []
  };
  
  // @ts-ignore
  const { error } = await supabase.from('leads').insert(dbData);
  if (error) return res.status(500).json({ error: error.message });
  res.json(lead);
});

app.put('/api/leads/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json(req.body);
  
  const lead = req.body;
  const dbData = {
    client_name: lead.clientName,
    company_name: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    service: lead.service,
    custom_service: lead.customService,
    budget: lead.budget,
    stage: lead.stage,
    assigned_to: lead.assignedTo,
    priority: lead.priority,
    updated_at: new Date().toISOString(),
    meeting_date: lead.meetingDate || null,
    notes: lead.notes || [],
    tasks: lead.tasks || [],
    activities: lead.activities || []
  };

  // @ts-ignore
  const { error } = await supabase.from('leads').update(dbData).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(lead);
});

app.delete('/api/leads/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json({ success: true });
  
  const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default app;
