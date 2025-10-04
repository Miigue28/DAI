import { connect_db, close_db } from './model/db.js'
import Product from './model/Product.js'

await connect_db()

// Productos de menos de 1 euro
const cheap_products = await Product.where('price_number').lte(1.0).exec()
console.log(cheap_products)

// Productos de menos de 1 euro que no sean agua
const cheap_non_water_products = await Product.where('price_number').lte(1.0).where('category').ne('agua').exec()
console.log(cheap_non_water_products)

// Aceites ordenados por precio
const sorted_oils = await Product.where('subcategory').equals('Aceite de oliva').sort('price_number').exec()
console.log(sorted_oils)

// Productos en garrafa
const tank_products = await Product.where('format_text').regex(/garrafa/i).exec()
console.log(tank_products)

await close_db()