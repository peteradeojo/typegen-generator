import prettier from 'prettier';

const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1);

function createRandomString(length: number) {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export class Generator {
	private typedefs: { [key: string]: any } = {};
	private discoveredTypes: Set<any> = new Set();

	constructor() {}

	checkIsArray(item: any) {
		if (typeof item !== 'object') {
			return -1;
		}

		if (Array.isArray(item)) return 1;

		return 0;
	}

	generateFromArray(item: any[]): string {
		const types = new Set();
		for (let i of item) {
			types.add(this.generate(i, createRandomString(4)));
		}

		const t: any[] = [];
		types.forEach((v, v2, s) => {
			t.push(v);
		});

		return 'Array<' + t.join('|') + '>';
	}

	generateStruct(item: any, name: string) {
		if (this.checkIsArray(item) !== 0) return;

		const keys = Object.keys(item);
		if (keys.length < 1) return 'any';
		let types: { [key: string]: any } = {};
		for (let i of keys) {
			types[i] = this.generate(item[i], i);
		}

		return types;
	}

	saveTypeDef(obj: any, name: string) {
		if (this.checkIsArray(obj) !== 0) {
			return;
		}

		// for (let i of Object.keys(obj)) {
		// 	if (this.checkIsArray(obj[i]) == 0) {
		// 		this.saveTypeDef(obj[i], i);
		// 	}
		// }
		const ck = Object.keys(obj).filter(
			(k: string) => this.checkIsArray(obj[k]) == 0
		);

		if (ck.length > 0) {
			ck.forEach((k) => this.saveTypeDef(obj[k], k));
		} else {
			const s = this.generateStruct(obj, name);
			if (!this.discoveredTypes.has(JSON.stringify(s))) {
				this.discoveredTypes.add(JSON.stringify(s));
				this.typedefs[JSON.stringify(s)] = name;
			}
		}
	}

	findStruct(item: any): string | void {
		if (this.discoveredTypes.has(JSON.stringify(item))) {
			return this.typedefs[JSON.stringify(item)];
		}
	}

	generateFromObject(item: any, name?: string) {
		const keys = Object.keys(item);
		if (keys.length < 1) return 'any';

		let types: { [key: string]: any } = {};
		for (let i of keys) {
			types[i] = this.generate(item[i], i);
		}

		const f = this.findStruct(types);
		if (f) {
			return capitalize(f);
		}

		let t = '{\n';
		for (let i of Object.keys(types)) {
			t += `${i}: ${types[i]};\n`;
		}
		t += '}';

		return t;
	}

	generate(item: any, name: string) {
		switch (this.checkIsArray(item)) {
			case -1:
				return typeof item;
			case 0:
				this.saveTypeDef(item, name);
				const g = this.generateFromObject(item);
				return g;
			case 1:
				return this.generateFromArray(item);
		}
	}

	async resolve(obj: any, name: string) {
		this.discoveredTypes = new Set();

		let output = '';

		const txt = this.generate(obj, name);

		this.discoveredTypes.forEach(async (typedef) => {
			const name = this.typedefs[typedef];
			output += `type ${capitalize(name)} = ${typedef};\n\n`;
		});

		output += `type ${name} = ${txt}`;

		// return await prettier.format(output, {
		// 	parser: 'typescript',
		// });
		return output;
	}
}

if (require.main == module) {
	const g = new Generator();
	const o = [
		{
			phone: {
				brand: 'iPhone',
				model: '13',
				version: 'iOS 17',
			},
			car: {
				make: 'Toyota',
				chasis: {
					num: '',
				},
				years: [
					2012,
					2018,
					{
						brand: 'iPhone',
						model: '',
						version: '',
					},
				],
				sys: {
					engine: 'v8',
					drive: 'front',
				},
			},
			color: 'red',
		},
	];

	const data = [
		{
			action: '',
		},
		{
			name: '',
			tasks: [],
			move: {
				direction: 'away',
			},
		},
	];
	(async () => {
		console.log(await g.resolve(data, 'Cat'));
	})();
}
