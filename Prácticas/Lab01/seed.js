import { read_file } from './parser.js'
import { connect_db, close_db } from './model/db.js'
import Product from './model/Product.js'

// https://mongoosejs.com/docs/api/model.html#Model.insertMany()
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
