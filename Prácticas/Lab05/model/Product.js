import { Schema, model } from 'mongoose';

const productSchema = new Schema({
	category: {
		type: String,
		required: true,
		trim: true,   // Removes whitespace
	},
  subcategory: {
    type: String,
    required: false,
    trim: true,
  },
	img_src: {
		type: String,
		required: true,
		trim: true,
	},
  img_alt: {
		type: String,
		required: true,
	},
  format_text: {
		type: String,
		required: true,
	},
  price_text: {
		type: String,
		required: true,
	},
  price_number: {
		type: Number,
		min: 0.0,
		max: 10000.0,
		required: true,
	},
	discount: {
		type: Number,
		min: 0.0,
		max: 0.5,
		required: false
	},
	discount_price_number: {
		type: Number,
		min: 0.0,
		max: 10000.0,
		required: false
	}
})

const Product = model('Producto', productSchema);
export default Product;