import { serve, response } from '../_shared/server.ts';

serve(async (req, supabase) => {
	if (req.method !== 'POST') {
		return response({ error: 'Method not allowed' }, true, 405);
	}

	const { data: userData, error: authError } = await supabase.auth.getUser();

	if (authError) {
		return response({ error: authError.message }, true, 401);
	}

	if (!userData?.user?.id) {
		return response({ error: 'Not authenticated' }, true, 401);
	}

	let payload;
	try {
		payload = await req.json();
	} catch {
		return response({ error: 'Invalid JSON body' }, true, 400);
	}

	const { book_id, will_read } = payload as { book_id?: number; will_read?: boolean };

	if (typeof book_id !== 'number' || typeof will_read !== 'boolean') {
		return response(
			{ error: 'Payload must include numeric book_id and boolean will_read' },
			true,
			400
		);
	}

	const { data, error } = await supabase.from('books').insert({
		book_id,
		will_read,
		user_id: userData.user.id
	});

	if (error) {
		return response({ error: error.message }, true, 500);
	}

	return response({ data });
});