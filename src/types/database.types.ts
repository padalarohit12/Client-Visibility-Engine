export type ProjectStatus = 'on_track' | 'at_risk' | 'blocked';

export type Project = {
  id: string;
  name: string;
  repository_url: string | null;
  status: ProjectStatus;
  progress_percent: number;
  impact_summary: string | null;
  created_at: string;
};

export type Commit = {
  id: string;
  project_id: string;
  hash: string;
  original_message: string;
  translated_message: string | null;
  author: string;
  created_at: string;
};

export type ClientPreference = {
  id: string;
  project_id: string;
  report_frequency: 'weekly' | 'monthly';
  delivery_channel: 'email' | 'whatsapp';
  contact_info: string;
  created_at: string;
};

export type ReportMetrics = {
  update_count: number;
  period_start: string;
  period_end: string;
  ai_strategist_advice: string[];
  roi_highlights?: {
    label: string;
    value: string;
    change?: string;
  }[];
  billing_summary?: {
    hours_worked: number;
    estimated_value: string;
    retainer_cost: string;
  };
};

export type Report = {
  id: string;
  project_id: string;
  type: 'weekly' | 'monthly';
  summary: string;
  metrics: ReportMetrics | null;
  status: string;
  channels: string[];
  created_at: string;
  Projects?: { name: string };
};
