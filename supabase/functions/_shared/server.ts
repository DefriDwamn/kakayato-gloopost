import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const jsonHeaders = {
	'Content-Type': 'application/json'
};

export const response = (data: unknown, json = true, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { ...(json ? jsonHeaders : {}), ...corsHeaders }
	});

export function serve(
	handler: (req: Request, supabase: ReturnType<typeof createClient>) => Promise<Response>
) {
	Deno.serve(async (req: Request) => {
		// I hate CORS
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders
			});
		}

		const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_DATABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
		const authHeader = req.headers.get('Authorization');

		if (!supabaseUrl || !supabaseKey) {
			return response({ error: 'Supabase config missing' }, true, 500);
		}

		const supabase = createClient(supabaseUrl, supabaseKey, {
			global: { headers: authHeader ? { Authorization: authHeader } : {} }
		});

		try {
			return await handler(req, supabase);
		} catch (error) {
			console.error('Function error', error);
			return response({ error: (error as Error).message || String(error) }, true, 500);
		}
	});
}
