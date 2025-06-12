// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qeqpcsjeevamxrzklqqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcXBjc2plZXZhbXhyemtscXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODEzNzIsImV4cCI6MjA2NTA1NzM3Mn0.qEsGOErfJPZ3GM3yRcXXK2xzUPvFwwdCzUSUWSU6jzc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
