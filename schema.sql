-- Create the Projects table
CREATE TABLE IF NOT EXISTS public."Projects" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    repository_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Commits table
CREATE TABLE IF NOT EXISTS public."Commits" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL, -- or UUID referencing Projects(id)
    hash TEXT NOT NULL,
    original_message TEXT NOT NULL,
    translated_message TEXT,
    author TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the ClientPreferences table
CREATE TABLE IF NOT EXISTS public."ClientPreferences" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    report_frequency TEXT CHECK (report_frequency IN ('weekly', 'monthly')),
    delivery_channel TEXT CHECK (delivery_channel IN ('email', 'whatsapp')),
    contact_info TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) policies
-- Note: Since this is a public read-only dashboard with webhooks pushing data from the backend,
-- we allow anonymous read access to Commits for the dashboard, but restrict insert/update to service_role only.

ALTER TABLE public."Commits" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on Commits"
    ON public."Commits"
    FOR SELECT
    TO public
    USING (true);

-- Backend inserts bypass RLS because they use the Service Role Key or we can explicitly allow anon inserts for dev.
-- In production, webhooks run server-side using service_role, so they bypass RLS automatically.
