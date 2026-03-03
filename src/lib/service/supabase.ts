import Context from '$lib/util/context';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const defaultClient = createClient(
	import.meta.env.VITE_SUPABASE_DATABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabaseCtx = new Context<SupabaseClient>('supabase-client');
