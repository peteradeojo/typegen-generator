import { Generator } from '..';
import axios from 'axios';

let g = new Generator();

describe('test generator', () => {
	it('generates type correctly for object', (done) => {
		axios.get('https://jsonplaceholder.typicode.com/posts/1').then((res) => {
			const s = g.resolve(res.data, 'Post');
			const d = g.discoveries();

			expect(d.types.size).toEqual(1);
			done();
		});
	});

	it('generates types for arrays correctly', (done) => {
		axios.get('https://jsonplaceholder.typicode.com/posts').then((res) => {
			g.resolve(res.data, 'Posts');
			const d = g.discoveries();
			expect(d.types.size).toEqual(1);
			done();
		});
	});

	it('identifies nested objects properly', () => {
		const data = [
			{
				person: [{
					name: '',
					auth: {
						username: '',
						accessLevel: 0,
					},
				}],
			},
		];

		g.resolve(data, 'Data');
		const d = g.discoveries();
		expect(d.types.size).toEqual(3);
	});

	it('identifies nested arrays', () => {
		const data: any[] = [{ name: 'Bolu' }];

		g.resolve(data, 'People');
		const d = g.discoveries();
		expect(d.types.size).toEqual(1);
	});
});
