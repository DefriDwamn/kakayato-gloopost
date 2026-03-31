import { parse } from 'jsr:@std/csv';

export async function loadFamousBooks() {
	const data = await Deno.readTextFile('../_shared/famous.txt');
	const books = parse(data, { columns: ['title', 'author', 'image'] }) as Array<{ title: string; author: string; image: string }>;
	return books.map((book) => ({
		...book,
		image: book.image?.replace(/^http:\/\//i, 'https://') ?? book.image
	}));
}
