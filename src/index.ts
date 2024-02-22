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
	// string - string map of structs
	private typedefs: { [key: string]: any } = {};

	// set of unique structs identified
	private discoveredTypes: Set<any> = new Set();

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
				return this.generateFromArray(item);
		}
	}

	async resolve(obj: any, name: string) {
		this.discoveredTypes = new Set();

		let output = '';

		const txt = this.generate(obj, name);

		this.discoveredTypes.forEach(async (typedef) => {
			const name = this.typedefs[typedef];
			output += `type ${capitalize(name)} = {\n`;

			for (let i of Object.keys(this.typeMaps[typedef])) {
				output += `${i}: ${this.typeMaps[typedef][i]};\n`;
			}

			output += `};\n\n`;
		});

		output += `type ${name} = ${txt}`;

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
			id: 1,
			name: 'Leanne Graham',
			username: 'Bret',
			email: 'Sincere@april.biz',
			address: {
				street: 'Kulas Light',
				suite: 'Apt. 556',
				city: 'Gwenborough',
				zipcode: '92998-3874',
				geo: {
					lat: '-37.3159',
					lng: '81.1496',
				},
			},
			phone: '1-770-736-8031 x56442',
			website: 'hildegard.org',
			company: {
				name: 'Romaguera-Crona',
				catchPhrase: 'Multi-layered client-server neural-net',
				bs: 'harness real-time e-markets',
			},
		},
		{
			id: 2,
			name: 'Ervin Howell',
			username: 'Antonette',
			email: 'Shanna@melissa.tv',
			address: {
				street: 'Victor Plains',
				suite: 'Suite 879',
				city: 'Wisokyburgh',
				zipcode: '90566-7771',
				geo: {
					lat: '-43.9509',
					lng: '-34.4618',
				},
			},
			phone: '010-692-6593 x09125',
			website: 'anastasia.net',
			company: {
				name: 'Deckow-Crist',
				catchPhrase: 'Proactive didactic contingency',
				bs: 'synergize scalable supply-chains',
			},
		},
		{
			id: 3,
			name: 'Clementine Bauch',
			username: 'Samantha',
			email: 'Nathan@yesenia.net',
			address: {
				street: 'Douglas Extension',
				suite: 'Suite 847',
				city: 'McKenziehaven',
				zipcode: '59590-4157',
				geo: {
					lat: '-68.6102',
					lng: '-47.0653',
				},
			},
			phone: '1-463-123-4447',
			website: 'ramiro.info',
			company: {
				name: 'Romaguera-Jacobson',
				catchPhrase: 'Face to face bifurcated interface',
				bs: 'e-enable strategic applications',
			},
		},
		{
			id: 4,
			name: 'Patricia Lebsack',
			username: 'Karianne',
			email: 'Julianne.OConner@kory.org',
			address: {
				street: 'Hoeger Mall',
				suite: 'Apt. 692',
				city: 'South Elvis',
				zipcode: '53919-4257',
				geo: {
					lat: '29.4572',
					lng: '-164.2990',
				},
			},
			phone: '493-170-9623 x156',
			website: 'kale.biz',
			company: {
				name: 'Robel-Corkery',
				catchPhrase: 'Multi-tiered zero tolerance productivity',
				bs: 'transition cutting-edge web services',
			},
		},
		{
			id: 5,
			name: 'Chelsey Dietrich',
			username: 'Kamren',
			email: 'Lucio_Hettinger@annie.ca',
			address: {
				street: 'Skiles Walks',
				suite: 'Suite 351',
				city: 'Roscoeview',
				zipcode: '33263',
				geo: {
					lat: '-31.8129',
					lng: '62.5342',
				},
			},
			phone: '(254)954-1289',
			website: 'demarco.info',
			company: {
				name: 'Keebler LLC',
				catchPhrase: 'User-centric fault-tolerant solution',
				bs: 'revolutionize end-to-end systems',
			},
		},
		{
			id: 6,
			name: 'Mrs. Dennis Schulist',
			username: 'Leopoldo_Corkery',
			email: 'Karley_Dach@jasper.info',
			address: {
				street: 'Norberto Crossing',
				suite: 'Apt. 950',
				city: 'South Christy',
				zipcode: '23505-1337',
				geo: {
					lat: '-71.4197',
					lng: '71.7478',
				},
			},
			phone: '1-477-935-8478 x6430',
			website: 'ola.org',
			company: {
				name: 'Considine-Lockman',
				catchPhrase: 'Synchronised bottom-line interface',
				bs: 'e-enable innovative applications',
			},
		},
		{
			id: 7,
			name: 'Kurtis Weissnat',
			username: 'Elwyn.Skiles',
			email: 'Telly.Hoeger@billy.biz',
			address: {
				street: 'Rex Trail',
				suite: 'Suite 280',
				city: 'Howemouth',
				zipcode: '58804-1099',
				geo: {
					lat: '24.8918',
					lng: '21.8984',
				},
			},
			phone: '210.067.6132',
			website: 'elvis.io',
			company: {
				name: 'Johns Group',
				catchPhrase: 'Configurable multimedia task-force',
				bs: 'generate enterprise e-tailers',
			},
		},
		{
			id: 8,
			name: 'Nicholas Runolfsdottir V',
			username: 'Maxime_Nienow',
			email: 'Sherwood@rosamond.me',
			address: {
				street: 'Ellsworth Summit',
				suite: 'Suite 729',
				city: 'Aliyaview',
				zipcode: '45169',
				geo: {
					lat: '-14.3990',
					lng: '-120.7677',
				},
			},
			phone: '586.493.6943 x140',
			website: 'jacynthe.com',
			company: {
				name: 'Abernathy Group',
				catchPhrase: 'Implemented secondary concept',
				bs: 'e-enable extensible e-tailers',
			},
		},
		{
			id: 9,
			name: 'Glenna Reichert',
			username: 'Delphine',
			email: 'Chaim_McDermott@dana.io',
			address: {
				street: 'Dayna Park',
				suite: 'Suite 449',
				city: 'Bartholomebury',
				zipcode: '76495-3109',
				geo: {
					lat: '24.6463',
					lng: '-168.8889',
				},
			},
			phone: '(775)976-6794 x41206',
			website: 'conrad.com',
			company: {
				name: 'Yost and Sons',
				catchPhrase: 'Switchable contextually-based project',
				bs: 'aggregate real-time technologies',
			},
		},
		{
			id: 10,
			name: 'Clementina DuBuque',
			username: 'Moriah.Stanton',
			email: 'Rey.Padberg@karina.biz',
			address: {
				street: 'Kattie Turnpike',
				suite: 'Suite 198',
				city: 'Lebsackbury',
				zipcode: '31428-2261',
				geo: {
					lat: '-38.2386',
					lng: '57.2232',
				},
			},
			phone: '024-648-3804',
			website: 'ambrose.net',
			company: {
				name: 'Hoeger LLC',
				catchPhrase: 'Centralized empowering task-force',
				bs: 'target end-to-end models',
			},
		},
	];
	(async () => {
		console.log(await g.resolve(data, 'Cat'));
	})();
}
