import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bxexrczrtysxfjsikquq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXhyY3pydHlzeGZqc2lrcXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzg2NDEsImV4cCI6MjA4OTk1NDY0MX0.vL6T02DJMuo6Qwxe7NfbzpEBzyMRZv_iNN_Qjc5FwKI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
