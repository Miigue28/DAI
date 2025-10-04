# Lab 01

> Author: Miguel Ángel Moreno Castro

## Dev Environment with Node.js + MongoDB

To set up our development environment we're going to follow the [Docker Labs](https://hub.docker.com/_/mongo) instructions to deploy [MongoDB](https://www.mongodb.com/docs/manual/introduction/) which is a NoSQL database.

```sh
mkdir Lab01 && cd !$
```

Once that we have the `docker-compose.yml` file we're required a `data` directory as a Docker volume so make sure to create it before deploying the container with the following command

```bash
docker compose up -d
```

> The `docker-compose.yml` template comes with Mongo Express which is a very simple database management web user interfase. You can access it by the default `localhost:8081` and create a DAI database.

Then we're going to install [Node.js](https://nodejs.org/en/download) which will be our main programming language throughout the course, it's commonly used by web devs as a Javascript runtime environment. We'll use [npm](https://www.npmjs.com/) as our packet manager, so we can initialise a Node environment by the following command

```sh
npm init -y
```

> We're using ES6 Modules so remember to add the `"type": "module"` in the `package.json` file.

It's recommended to follow the [MongoDB Get Started](https://www.mongodb.com/docs/get-started/?language=nodejs) - Create Your First MongoDB Application to see how to connect to the database and how to perfom simple CRUD operations.

## Web Parsing

To fill our database with useful data we're going to perform a simple web scraping to the [Mercadona's Category Page](https://tienda.mercadona.es/categories/112). We'll also need to install a Javascript parsing tool 

```sh
npm install node-html-parser
```

We'll need to extract with the browser developer tools the HTML of the products of the desired category. In esence, it'll between the following HTML tags

```html
<div class="grid-layout__main-container" ...> ...</>
```

> Every page needs to be storaged in the `resource` directory for the script to scrape them.

In our script we obviously need to read/write files from our filesystem, this actions will be performed through the `fs` functions from the Node library.

```js
import fs from "node:fs";
export function read_file(file) {
  try {
    return fs.readFileSync("./resources/" + file, "utf8");
  } catch (error) {
    console.error("Error while reading file: ", error);
  }
}
function save_file(file) {
	try {
  	fs.writeFileSync("./resources/" + file, JSON.stringify(Info, null, 2));
  	console.log("File successfully saved.");
	} catch (error) {
	  console.error("Error while saving file: ", error);
	}
}
```

Basically, we'll use the browser development tools to know which elements of the HTML file contains the information that we need. We then use the DOM API functions `querySelector()` and `querySelectorAll()` to extract the desired elements and the information they contain.

```js
function process_file(file) {
	const html = read_file(file);
	const root = parse(html);

	const category = normalize_whitespace(root.querySelector("h1").text);
	const sections = root.querySelectorAll("section.section");

	for (const section of sections) {
		const subcategory = normalize_whitespace(section.querySelector("h2").text);
		const products = section.querySelectorAll("div.product-cell");

		for (const product of products) {
			const img = product.querySelector("img");
			const img_src = img.attrs.src;
			const img_alt = img.attrs.alt;
			const format = product.querySelector("div.product-format");
			const format_text = normalize_whitespace(format.text);
			const price = product.querySelector("div.product-price");
			const price_text = normalize_whitespace(price.text);
			const tmp = price_text.match(/(\d+),?(\d+)?(.+)/);
			const price_number = tmp.length > 2 ? Number(tmp[1] + "." + tmp[2]) : undefined;
			const info_prod = {
			  category,
				subcategory,
			  img_src,
			  img_alt,
			  format_text,
			  price_text,
			  price_number,
			};
			console.log(info_prod);
			Info.push(info_prod);
		}
		save_file("datos_mercadona.json");
	}
}
```

> The `normalize_whitespace()` function is basically to parse the output text as want. It removes new lines, multiple spaces, and trims leading/trailing spaces

```js
function normalize_whitespace(text) {
  let tmp = text.replace("\n", "");
  tmp = tmp.replace(/\s+/g, " ");
  return tmp.trim();
}
```

### Database Initialisation

To provide our database with the extracted information from Mercadona that we've collected, we're going to use an Object Data Modelling (ODM) library for MongoDB called [mongoose](https://www.mongodb.com/docs/drivers/node/current/integrations/mongoose-get-started/). The installation of the library proceeds as usual

```bash
npm install mongoose
```

Through the extent of the project we're going to use a MVC software scheme so, in order to follow that scheme we'll create a `model` directory to contain every detail regarding the database management.

Following the mongoose tutorial we create a simple function to properly connect to the database

```js
import mongoose from "mongoose";

const url = `mongodb://root:example@localhost:27017/DAI?authSource=admin`;

export async function connect_db() {
	try {
		await mongoose.connect(url);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
	const connection = mongoose.connection;
	connection.once("open", (_) => {
		console.log(`Database connected: ${url}`);
	});
	connection.on("error", (err) => {
		console.error(`Connection error: ${err}`);
	});
	return;
}
export async function close_db() {
	try {
		await mongoose.close()
	} catch (err) {
		console.error(err.message)
		process.exit(1)
	}
}
```

Next, we create a schema which, as Mongoose documentation states, defines the structure of our collection documents and it's mapped directly to a MongoDB collection.

> For simplicity, we've not taken into account the [Validators](https://mongoosejs.com/docs/validation.html) but they'll necessary at least for some fields.

On the other hand, models take our schema and apply it to each document in its collection. They are responsible for all document interaction such as create, read, update and delete (CRUD) operations.

> The documentation recommends to pass to the model the singular form of our collection name. Mongoose automatically changes this to the plural form, transforms it to lowercase, and uses that for the database collection name.

```js
import { Schema, model } from 'mongoose';
const productSchema = new Schema({
	category: String,
	subcategory: String,
	img_src: String,
	img_alt: String,
	format_text: String,
	price_text: String,
	price_number: Number
})
const Product = model('Producto', productSchema);
export default Product;
```

Following up we insert every product that we have previosly scraped from Mercadona:

```js
import mongoose from 'mongoose'
import fs from 'node:fs'
import { connect_db, close_db } from './model/db.js'
import Product from './model/Product.js'

function read_file(file) {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch (err) {
		console.error("Error while reading file:", err);
	}
}
async function insert_documents(model, items) {
	try {
		const inserted = await model.insertMany(items)
		console.log(`There are ${inserted.length} documents inserted`)
	} catch (error) {
		console.error(`Error inserting documents: ${error.message}`)
	}
}
await connect_db()
const products = read_file('datos_mercadona.json')
const parsed_products = JSON.parse(products)
await insert_documents(Product, parsed_products)
await close_db()
```

Our next task is manage document queries, we'll be following the documentation [Query](https://mongoosejs.com/docs/api/query.html#Query.prototype.ne()) where we can find plenty of functions to perfom the desired queries.

For instance, to perform a query we can just simply call either `find()` or `findOne()` in the collection model. 

```js
const oils = await Product.find({subcategory: "Aceite de Oliva"})
```

As in relational databases we have the `where()` and `select()` functions, where the latter performs projections over any specified field.

```js
const tank_products = await Product.where('price_number').lte(1.0).select('img_alt').exec()
```

```js
// Productos de menos de 1 euro
const cheap_products = await Product.where('price_number').lte(1.0).exec()
// Productos de menos de 1 euro que no sean agua
const cheap_non_water_products = await Product.where('price_number').lte(1.0).where('category').ne('agua').exec()
// Aceites ordenados por precio
const sorted_oils = await Product.where('subcategory').equals('Aceite de oliva').sort('price_number').exec()
// Productos en garrafa
const tank_products = await Product.where('format_text').regex(/garrafa/i).exec()
```

Finally, we'll try to perform a security copy of the database using [mongodump](https://www.mongodb.com/docs/database-tools/mongodump/#mongodb-binary-bin.mongodump) utility. Firstly, we're going to install the utility by 

```sh
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.13.0.deb
sudo apt install ./mongodb-database-tools-debian12-x86_64-100.13.0.deb 
```

Then it's just as easy as executing the following command

```bash
mongodump --uri="mongodb://root:example@localhost:27017/DAI?authSource=admin" --db=DAI --collection=productos
```