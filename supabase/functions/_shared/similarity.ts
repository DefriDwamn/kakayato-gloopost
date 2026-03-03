import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export async function loadSimilarity(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.storage
		.from('similarity')
		.download('similarity.txt');

	if (error) throw error;
	if (!data) throw new Error('similarity.txt is empty');

	const text = await data.text();

	return text
		.trim()
		.split('\n')
		.map((line) => line.split(',').map((x) => Number.parseFloat(x)));
}