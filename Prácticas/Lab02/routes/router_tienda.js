import express from "express";
import Product from "../model/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get cart item count from session
    const cart_item_count = req.session.cart.length;

    // Fetch multiple products (array) for the template loop.
    const products = await Product.find({}).limit(8).lean();
    res.render('portada.html', { products, cart_item_count });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

router.get("/search-results", async (req, res) => {
  try {
    // Get cart item count from session
    const cart_item_count = req.session.cart.length;

    // Search products by 'img_alt' field using case-insensitive substring match
    const query = req.query.q || '';
    const products = await Product.find({ img_alt: { $regex: query, $options: 'i' } }).lean();
    const size = products.length;
    res.render('search_results.html', { products, size, query, cart_item_count });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

//router.get("/cart", async (req, res) => {
//  try {
//    if (!req.session.cart) {
//      req.session.cart = [];
//    } else {
//      const productsInCart = req.session.cart;
//      const products = await Product.find({ _id: { $in: productsInCart } }).lean();
//      res.render('cart.html', { products });
//    }
//  } catch (err) {
//    console.error(err);
//    res.status(500).send(err);
//  }
//})

router.get("/cart/:id", async (req, res) => {
  try {
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    } else {
      const id = req.params.id;
      const product = await Product.findById(id).lean();
      // Check if product exists in database
      if (!product) {
        return res.status(404).send({ message: "Unavailable id" });
      } else {
        // Add product to cart or update quantity
        const product = req.session.cart.find((item) => item.id == id);
        if (!product) {
          req.session.cart.push({"id" : id, "quantity" : 1});
        } else {
          product.quantity += 1;
        }
      }
    }
    res.redirect(req.get('referer'));
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

export default router