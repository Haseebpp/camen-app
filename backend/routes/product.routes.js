import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateProduct } from '../validation/product.validation.js';

const router = express.Router();

router.route('/')
    .get(protect, getProducts)
    .post(protect, validateProduct, createProduct);

router.route('/:id')
    .get(protect, getProduct)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

export default router;
