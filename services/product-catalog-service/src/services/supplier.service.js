const Supplier = require('../models/supplier.model');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class SupplierService {
  /**
   * Create a new supplier
   */
  async createSupplier(supplierData) {
    try {
      const supplier = new Supplier(supplierData);
      await supplier.save();

      logger.info(`Supplier created: ${supplier.name}`);

      return supplier;
    } catch (error) {
      logger.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Supplier not found'
        };
      }

      return supplier;
    } catch (error) {
      logger.error('Error getting supplier:', error);
      throw error;
    }
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(includeInactive = false) {
    try {
      const query = includeInactive ? {} : { isActive: true };
      
      const suppliers = await Supplier.find(query).sort('name');

      return suppliers;
    } catch (error) {
      logger.error('Error getting suppliers:', error);
      throw error;
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(supplierId, updateData) {
    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Supplier not found'
        };
      }

      Object.assign(supplier, updateData);
      await supplier.save();

      logger.info(`Supplier updated: ${supplier.name}`);

      return supplier;
    } catch (error) {
      logger.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(supplierId) {
    try {
      const supplier = await Supplier.findByIdAndDelete(supplierId);
      if (!supplier) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Supplier not found'
        };
      }

      logger.info(`Supplier deleted: ${supplier.name}`);

      return supplier;
    } catch (error) {
      logger.error('Error deleting supplier:', error);
      throw error;
    }
  }
}

module.exports = new SupplierService();

