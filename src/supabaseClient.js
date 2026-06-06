import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ujunyfpzekhgiropkzgi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdW55ZnB6ZWtoZ2lyb3BremdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTIzMzQsImV4cCI6MjA5NjE2ODMzNH0.F7KI5fkzvlvnH3TBbCrqzTKvIuDtmktWzgcVwIjkqYk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);