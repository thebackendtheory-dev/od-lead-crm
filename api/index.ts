import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

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
    service: row.service,
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
    service: lead.service,
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
    service: lead.service,
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
