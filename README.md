# Typegen Generator

Typegen Generator is the zero-dependency (not completely true) package that powers the type generation for the [Typegen Project](https://typegen.vercel.app).

## Usage
To install
```sh
$ npm i typegen-generator@latest
```

Use the `Generator` class in your project

```js
import { Generator } from 'typegen-generator';

const generator = new Generator();
const types = generator.resolve(object, nameOfType);
```

# Contributing
All contributions are welcome.

# See also
    - [Typegen CLI](https://github.com/peteradeojo/typegencli)
