import type { SupabaseClient } from '@supabase/supabase-js';
import type { Book, ViewedBook } from './types';

export class BookService {
	private readonly supabase: SupabaseClient;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
	}

	async getRandomBook(): Promise<Book> {
		const { data: { session }, error } = await this.supabase.auth.getSession();
		if (error) throw error;
		if (!session?.access_token) throw new Error('Not authenticated');

		const res = await this.supabase.functions.invoke('recommend', {
			headers: { Authorization: `Bearer ${session.access_token}` }
		});

		if (res.error) throw res.error;
		return res.data as Book;
	}

	async getViewed(): Promise<ViewedBook[]> {
		const books = await this.supabase.functions.invoke('all-books');
		return books.data as ViewedBook[];
	}

	private async insert(row: { book_id: number; will_read: boolean }) {
		const { data, error } = await this.supabase.auth.getUser();

		if (error !== null) {
			console.log(error);
			return;
		}

		await this.supabase.from('books').insert({ ...row, user_id: data.user.id });
	}

	likeBook(id: Book['id']) {
		return this.insert({ book_id: id, will_read: true });
	}

	dislikeBook(id: Book['id']) {
		return this.insert({ book_id: id, will_read: false });
	}
}
