import express from "express";
import Product from "../model/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get cart items from session
    const cart_items = req.session.cart;
    console.log("Cart items:", cart_items);

    // Fetch multiple products (array) for the template loop.
    const products = await Product.find({}).limit(8).lean();
    res.render('portada.html', { products, cart_items, cart_item_count: cart_items.length });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

router.get("/search-results", async (req, res) => {
  try {
    // Get cart items from session
    const cart_items = req.session.cart;

    // Search products by 'img_alt' field using case-insensitive substring match
    const query = req.query.q || '';
    const products = await Product.find({ img_alt: { $regex: query, $options: 'i' } }).lean();
    const size = products.length;
    res.render('search_results.html', { products, size, query, cart_items, cart_item_count: cart_items.length });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

router.get("/cart/:id", async (req, res) => {
  try {
    // Check if product exists in database
    const id = req.params.id;
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).send({ message: "Unavailable product" });
    } else {
      // Add product to cart or update quantity
      const already_in_cart = req.session.cart.find((item) => item.id == id);
      if (!already_in_cart) {
        req.session.cart.push({"id" : id, "product": product, "quantity" : 1});
      } else {
        already_in_cart.quantity += 1;
      }
    }
    res.redirect(req.get('referer'));
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

export default router