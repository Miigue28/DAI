import express from 'express';

import logger from '../utils/logger.js';

import Product from '../model/Product.js';

const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Retrieve API status
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API is running!
 */
router.get('/status', (req, res) => {
  res.json({ message: 'API is running!' });
});


/**
 * @swagger
 * /api/products:
 *  get:
 *   summary: Retrieve a list of products
 *   responses:
 *    200:
 *     description: List of all products
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         products:
 *          type: array
 *          items:
 *           $ref: '#/components/schemas/Product'
 *    500:
 *     description: Could not retrieve products
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 *       example:
 *         error: Could not retrieve products
 *         details: "Error message..." 
*/
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json({ products });
    logger.info('Retrieved products successfully');
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve products', details: err });
    logger.error(`Error retrieving products: ${err}`);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *  get:
 *    summary: Retrieve a single product by ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    description: The ID of the product to retrieve
 *    responses:
 *      200:
 *        description: A single product
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                product:
 *                  $ref: '#/components/schemas/Product'
 *      404:
 *        description: Product not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                details:
 *                  type: string
 *            example:
 *              error: Product not found
 *              details: "Error message..."  
 */
router.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).lean();
    res.json({ product });
    logger.info(`Retrieved product with ID ${id} successfully`);
  } catch (err) {
    res.status(404).json({ error: 'Product not found', details: err });
    logger.error(`Error retrieving product with ID ${id}: ${err}`);
  }
});

/**
 * @swagger
 * /api/products:
 *  post:
 *   summary: Create a new product
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Product'
 *   responses:
 *    200:
 *      description: Successfully created product
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *              product:
 *                $ref: '#/components/schemas/Product'
 *    500:
 *      description: Server error
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              error:
 *                type: string
 *              details:
 *                type: string
 *          example:
 *            error: Unable to create product
 *            details: "Error message..."
 */
router.post('/products', async (req, res) => {
  try {
    // Destructure product data from request body
    const { category, subcategory, img_src, img_alt, format_text, price_text, price_number, discount, discount_price_number } = req.body;
    // Save new product to database
    const product = new Product({ category, subcategory, img_src, img_alt, format_text, price_text, price_number, discount, discount_price_number });
    await product.save();
    res.json({ message: 'Product successfully created', product: product });
    logger.info(`Created new product with ID ${product._id} successfully`);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to create product', details: err });
    logger.error(`Error creating product: ${err}`);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *  delete:
 *    summary: Delete a product by ID
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *    schema:
 *      type: string
 *    description: The ID of the product to delete
 *    responses:
 *      200:
 *        description: Successfully deleted product
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *            properties:
 *              message:
 *                type: string
 *            example:
 *              message: Product successfully deleted
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *            properties:
 *              error:
 *                type: string
 *              details:
 *                type: string
 *            example:
 *              error: Unable to delete product
 *              details: "Error message..."
 */
router.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product successfully deleted' });
    logger.info(`Deleted product with ID ${id} successfully`);
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete product', details: err });
    logger.error(`Error deleting product with ID ${id}: ${err}`);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *  put:
 *    summary: Update a product by ID
 *    parameters:
 *    - in: path
 *      name: id
 *      required: true
 *    schema:
 *      type: string
 *    description: The ID of the product to update
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *    responses:
 *      200:
 *        description: Product updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                product:
 *                  $ref: '#/components/schemas/Product'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                details:
 *                  type: string
 *          example:
 *            error: Unable to update product
 *            details: "Error message..."
 */
router.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { category, subcategory, img_src, img_alt, format_text, price_text, price_number, discount, discount_price_number } = req.body;
    const updated_product = await Product.findByIdAndUpdate(id, { category, subcategory, img_src, img_alt, format_text, price_text, price_number, discount, discount_price_number }, { new: true });
    res.json({ message: 'Product successfully updated', product: updated_product });
    logger.info(`Updated product with ID ${id} successfully`);
  } catch (err) {
    res.status(500).json({ error: 'Unable to update product', details: err });
    logger.error(`Error updating product with ID ${id}: ${err}`);
  }
});

export default router;