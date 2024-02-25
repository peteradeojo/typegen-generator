const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1);

const singularize = (str: string) => {
	const preMapped: { [key: string]: string } = {
		people: 'person',
	};
	const vowels = 'aeiou'.split('');
	const s = str.toLowerCase();
	if (s in preMapped) {
		return preMapped[str.toLowerCase()];
	}

	return str;
};

function createRandomString(length: number) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export class Generator {
	// string - string map of structs
	private typedefs: { [key: string]: any } = {};

	// set of unique structs identified
	private discoveredTypes: Set<string> = new Set();

	// map of string to raw object value
	private typeMaps: { [key: string]: any } = {};

	constructor() {}

	checkIsArray(item: any) {
		if (typeof item !== 'object') {
			return -1;
		}

		if (Array.isArray(item)) return 1;

		return 0;
	}

	generateFromArray(item: any[], name: string): string {
		if (item.length == 0) {
			return 'Array<never>';
		}

		const types = new Set();
		for (let i of item) {
			types.add(this.generate(i, singularize(name))); //createRandomString(4)));
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
		const ck = Object.keys(obj).filter(
			(k: string) => this.checkIsArray(obj[k]) == 0
		);

		if (ck.length > 0) {
			ck.forEach((k) => this.saveTypeDef(obj[k], k));
		}

		const s = this.generateStruct(obj, name);
		if (!this.discoveredTypes.has(JSON.stringify(s))) {
			/**
			 * Thank God for Adeyemi Olusola Michael: https://github.com/Adeyemi-olusola
			 */
			this.typeMaps[JSON.stringify(s)] = s;
			this.discoveredTypes.add(JSON.stringify(s));
			this.typedefs[JSON.stringify(s)] = name;
		}
	}

	findStruct(item: any): string | void {
		// locate struct in set of identified unique structs
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
				return this.generateFromArray(item, singularize(name));
		}
	}

	discoveries() {
		return {
			types: this.discoveredTypes,
			defs: this.typedefs,
			maps: this.typeMaps,
		};
	}

	resolve(obj: any, name: string) {
		this.discoveredTypes = new Set();
		this.typeMaps = {};
		this.typedefs = {};

		let output = '';

		const c = this.checkIsArray(obj);

		const txt = this.generate(obj, name);

		this.discoveredTypes.forEach((typedef) => {
			const name = this.typedefs[typedef];
			output += `type ${capitalize(name)} = {\n`;

			for (let i of Object.keys(this.typeMaps[typedef])) {
				output += `${i}: ${this.typeMaps[typedef][i]};\n`;
			}

			output += `};\n\n`;
		});

		if (c !== 0) {
			output += `type ${name} = ${txt};`;
		}

		return output;
	}
}
