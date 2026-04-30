-- Run this in the Supabase SQL Editor to create the articles table

CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  image TEXT,
  date TEXT NOT NULL,
  author TEXT,
  legacySlug TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can fetch articles)
CREATE POLICY "Public read access" 
  ON public.articles 
  FOR SELECT 
  USING (true);

-- Allow authenticated users (admin) to insert articles
CREATE POLICY "Admin insert access" 
  ON public.articles 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (admin) to update articles
CREATE POLICY "Admin update access" 
  ON public.articles 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users (admin) to delete articles
CREATE POLICY "Admin delete access" 
  ON public.articles 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
