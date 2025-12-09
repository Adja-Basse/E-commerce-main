const Category = require('../models/category.model');
const Product = require('../models/product.model');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    try {
      // Generate slug from name if not provided
      if (!categoryData.slug) {
        categoryData.slug = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Verify parent category exists if provided
      if (categoryData.parentCategory) {
        const parent = await Category.findById(categoryData.parentCategory);
        if (!parent) {
          throw {
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: 'Parent category not found'
          };
        }
      }

      const category = new Category(categoryData);
      await category.save();

      logger.info(`Category created: ${category.name}`);

      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId)
        .populate('parentCategory', 'name slug');

      if (!category) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Category not found'
        };
      }

      return category;
    } catch (error) {
      logger.error('Error getting category:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(includeInactive = false) {
    try {
      const query = includeInactive ? {} : { isActive: true };
      
      const categories = await Category.find(query)
        .populate('parentCategory', 'name slug')
        .sort('displayOrder name');

      return categories;
    } catch (error) {
      logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree() {
    try {
      const allCategories = await Category.find({ isActive: true })
        .sort('displayOrder name');

      // Build tree structure
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map
      allCategories.forEach(cat => {
        categoryMap.set(cat._id.toString(), {
          ...cat.toObject(),
          subcategories: []
        });
      });

      // Second pass: build tree
      allCategories.forEach(cat => {
        const categoryObj = categoryMap.get(cat._id.toString());
        if (cat.parentCategory) {
          const parent = categoryMap.get(cat.parentCategory.toString());
          if (parent) {
            parent.subcategories.push(categoryObj);
          }
        } else {
          rootCategories.push(categoryObj);
        }
      });

      return rootCategories;
    } catch (error) {
      logger.error('Error getting category tree:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Category not found'
        };
      }

      // Update slug if name changed
      if (updateData.name && updateData.name !== category.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Verify parent category if changed
      if (updateData.parentCategory) {
        if (updateData.parentCategory.toString() === categoryId.toString()) {
          throw {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: 'Category cannot be its own parent'
          };
        }
        const parent = await Category.findById(updateData.parentCategory);
        if (!parent) {
          throw {
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: 'Parent category not found'
          };
        }
      }

      Object.assign(category, updateData);
      await category.save();

      logger.info(`Category updated: ${category.name}`);

      return category;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    try {
      // Check if category has products
      const productCount = await Product.countDocuments({ category: categoryId });
      if (productCount > 0) {
        throw {
          statusCode: HTTP_STATUS.CONFLICT,
          message: `Cannot delete category with ${productCount} products`
        };
      }

      // Check if category has subcategories
      const subcategoryCount = await Category.countDocuments({ parentCategory: categoryId });
      if (subcategoryCount > 0) {
        throw {
          statusCode: HTTP_STATUS.CONFLICT,
          message: `Cannot delete category with ${subcategoryCount} subcategories`
        };
      }

      const category = await Category.findByIdAndDelete(categoryId);
      if (!category) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Category not found'
        };
      }

      logger.info(`Category deleted: ${category.name}`);

      return category;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug })
        .populate('parentCategory', 'name slug');

      if (!category) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Category not found'
        };
      }

      return category;
    } catch (error) {
      logger.error('Error getting category by slug:', error);
      throw error;
    }
  }
}

module.exports = new CategoryService();

