const supplierService = require('../services/supplier.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class SupplierController {
  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body);
      const response = ApiResponse.created(supplier, 'Supplier created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create supplier controller error:', error);
      next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      const response = ApiResponse.success(supplier);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get supplier controller error:', error);
      next(error);
    }
  }

  async getAllSuppliers(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const suppliers = await supplierService.getAllSuppliers(includeInactive);
      const response = ApiResponse.success(suppliers);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get suppliers controller error:', error);
      next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id, req.body);
      const response = ApiResponse.success(supplier, 'Supplier updated successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update supplier controller error:', error);
      next(error);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      await supplierService.deleteSupplier(req.params.id);
      const response = ApiResponse.success(null, 'Supplier deleted successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Delete supplier controller error:', error);
      next(error);
    }
  }
}

module.exports = new SupplierController();

