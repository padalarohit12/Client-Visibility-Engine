export type Project = {
  id: string;
  name: string;
  repository_url: string;
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
