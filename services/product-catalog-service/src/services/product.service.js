const Product = require('../models/product.model');
const Category = require('../models/category.model');
const logger = require('../../../../shared/utils/logger');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    try {
      // Generate slug from name if not provided
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Verify category exists
      const category = await Category.findById(productData.category);
      if (!category) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Category not found'
        };
      }

      const product = new Product(productData);
      await product.save();

      logger.info(`Product created: ${product.sku}`);

      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name slug')
        .populate('supplier', 'name email');

      if (!product) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Product not found'
        };
      }

      return product;
    } catch (error) {
      logger.error('Error getting product:', error);
      throw error;
    }
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug })
        .populate('category', 'name slug')
        .populate('supplier', 'name email');

      if (!product) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Product not found'
        };
      }

      return product;
    } catch (error) {
      logger.error('Error getting product by slug:', error);
      throw error;
    }
  }

  /**
   * Get all products with filters and pagination
   */
  async getProducts(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = '-createdAt',
        search,
        category,
        status,
        minPrice,
        maxPrice,
        isFeatured
      } = filters;

      const query = {};

      // Status filter
      if (status) {
        query.status = status;
      } else {
        query.status = 'active'; // Default to active products
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Featured filter
      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured === 'true' || isFeatured === true;
      }

      // Search filter
      if (search) {
        query.$text = { $search: search };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('category', 'name slug')
          .populate('supplier', 'name')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(query)
      ]);

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error('Error getting products:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, updateData) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Product not found'
        };
      }

      // Update slug if name changed
      if (updateData.name && updateData.name !== product.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Verify category if changed
      if (updateData.category) {
        const category = await Category.findById(updateData.category);
        if (!category) {
          throw {
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: 'Category not found'
          };
        }
      }

      Object.assign(product, updateData);
      await product.save();

      logger.info(`Product updated: ${product.sku}`);

      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Product not found'
        };
      }

      logger.info(`Product deleted: ${product.sku}`);

      return product;
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10) {
    try {
      const products = await Product.find({
        isFeatured: true,
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort('-createdAt')
        .limit(limit);

      return products;
    } catch (error) {
      logger.error('Error getting featured products:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId, limit = 20) {
    try {
      const products = await Product.find({
        category: categoryId,
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort('-createdAt')
        .limit(limit);

      return products;
    } catch (error) {
      logger.error('Error getting products by category:', error);
      throw error;
    }
  }
}

module.exports = new ProductService();

