-- Create the Projects table
CREATE TABLE IF NOT EXISTS public."Projects" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    repository_url TEXT,
    status TEXT DEFAULT 'on_track', -- on_track, at_risk, blocked
    progress_percent INTEGER DEFAULT 0,
    impact_summary TEXT, -- High level business impact summary
    hourly_rate NUMERIC DEFAULT 2500,
    retainer_cost NUMERIC DEFAULT 80000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Commits table
CREATE TABLE IF NOT EXISTS public."Commits" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public."Projects"(id) ON DELETE CASCADE,
    hash TEXT NOT NULL,
    original_message TEXT NOT NULL,
    translated_message TEXT,
    author TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the ClientPreferences table
CREATE TABLE IF NOT EXISTS public."ClientPreferences" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public."Projects"(id) ON DELETE CASCADE,
    report_frequency TEXT CHECK (report_frequency IN ('weekly', 'monthly')),
    delivery_channel TEXT CHECK (delivery_channel IN ('email', 'whatsapp')),
    contact_info TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Reports table
CREATE TABLE IF NOT EXISTS public."Reports" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public."Projects"(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('weekly', 'monthly')) NOT NULL,
    summary TEXT NOT NULL,
    metrics JSONB,
    status TEXT DEFAULT 'generated',
    channels TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public."Projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Commits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reports" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all for the dashboard
CREATE POLICY "Allow public read access on Projects" ON public."Projects" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on Commits" ON public."Commits" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on Reports" ON public."Reports" FOR SELECT TO public USING (true);
