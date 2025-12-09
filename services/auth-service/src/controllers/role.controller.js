const Role = require('../models/role.model');
const UserRole = require('../models/userRole.model');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class RoleController {
  /**
   * Get all roles
   * GET /api/auth/roles
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await Role.find({ isActive: true }).sort({ name: 1 });
      const response = ApiResponse.success(roles);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get all roles error:', error);
      next(error);
    }
  }

  /**
   * Get role by ID
   * GET /api/auth/roles/:id
   */
  async getRoleById(req, res, next) {
    try {
      const role = await Role.findById(req.params.id);
      if (!role) {
        const response = ApiResponse.notFound('Role not found');
        return res.status(response.statusCode).json(response.toJSON());
      }

      const response = ApiResponse.success(role);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get role by ID error:', error);
      next(error);
    }
  }

  /**
   * Create a new role
   * POST /api/auth/roles
   */
  async createRole(req, res, next) {
    try {
      const role = new Role(req.body);
      await role.save();

      const response = ApiResponse.created(role, 'Role created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create role error:', error);
      next(error);
    }
  }

  /**
   * Assign role to user
   * POST /api/auth/roles/:roleId/assign
   */
  async assignRoleToUser(req, res, next) {
    try {
      const { userId } = req.body;
      const { roleId } = req.params;
      const assignedBy = req.userId || req.user?.userId;

      // Check if role exists
      const role = await Role.findById(roleId);
      if (!role) {
        const response = ApiResponse.notFound('Role not found');
        return res.status(response.statusCode).json(response.toJSON());
      }

      // Check if already assigned
      const existing = await UserRole.findOne({ userId, roleId });
      if (existing) {
        if (existing.isActive) {
          const response = ApiResponse.error('Role already assigned to user', null, HTTP_STATUS.CONFLICT);
          return res.status(response.statusCode).json(response.toJSON());
        } else {
          // Reactivate
          existing.isActive = true;
          existing.assignedBy = assignedBy;
          await existing.save();
          const response = ApiResponse.success(existing, 'Role reactivated');
          return res.status(response.statusCode).json(response.toJSON());
        }
      }

      // Create new assignment
      const userRole = new UserRole({
        userId,
        roleId,
        assignedBy
      });

      await userRole.save();

      const response = ApiResponse.created(userRole, 'Role assigned successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Assign role error:', error);
      next(error);
    }
  }

  /**
   * Remove role from user
   * DELETE /api/auth/roles/:roleId/users/:userId
   */
  async removeRoleFromUser(req, res, next) {
    try {
      const { userId, roleId } = req.params;

      const userRole = await UserRole.findOne({ userId, roleId });
      if (!userRole) {
        const response = ApiResponse.notFound('Role assignment not found');
        return res.status(response.statusCode).json(response.toJSON());
      }

      userRole.isActive = false;
      await userRole.save();

      const response = ApiResponse.success(null, 'Role removed successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Remove role error:', error);
      next(error);
    }
  }
}

module.exports = new RoleController();

