const axios = require('axios');
const logger = require('../../../../shared/utils/logger');

/**
 * Keycloak Service
 * Handles all Keycloak operations
 */
class KeycloakService {
  constructor() {
    this.keycloakUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
    this.realm = process.env.KEYCLOAK_REALM || 'ecommerce';
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'ecommerce-backend';
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    this.adminUsername = process.env.KEYCLOAK_ADMIN || 'admin';
    this.adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin123';
    
    this.adminToken = null;
    this.adminTokenExpiry = null;
  }

  /**
   * Check if Keycloak is configured
   */
  isConfigured() {
    return !!(this.keycloakUrl && this.clientId);
  }

  /**
   * Get admin access token
   */
  async getAdminToken() {
    try {
      // Return cached token if still valid
      if (this.adminToken && this.adminTokenExpiry && new Date() < this.adminTokenExpiry) {
        return this.adminToken;
      }

      const response = await axios.post(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.adminUsername,
          password: this.adminPassword
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.adminToken = response.data.access_token;
      // Set expiry 30 seconds before actual expiry
      const expiresIn = response.data.expires_in - 30;
      this.adminTokenExpiry = new Date(Date.now() + expiresIn * 1000);

      return this.adminToken;
    } catch (error) {
      logger.error('Failed to get Keycloak admin token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get client access token
   */
  async getClientToken() {
    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId
      });

      if (this.clientSecret) {
        params.append('client_secret', this.clientSecret);
      }

      const response = await axios.post(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get Keycloak client token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Validate token with Keycloak
   */
  async validateToken(token) {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      const response = await axios.post(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`,
        new URLSearchParams({
          token: token,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.active === true;
    } catch (error) {
      logger.error('Failed to validate token with Keycloak:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get user info from Keycloak token
   */
  async getUserInfo(accessToken) {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const response = await axios.get(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get user info from Keycloak:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Create user in Keycloak
   */
  async createUser(userData) {
    try {
      if (!this.isConfigured()) {
        logger.warn('Keycloak is not configured, skipping user creation');
        return null;
      }

      const adminToken = await this.getAdminToken();

      const keycloakUser = {
        username: userData.email,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: true,
        emailVerified: false,
        credentials: [{
          type: 'password',
          value: userData.password,
          temporary: false
        }]
      };

      const response = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users`,
        keycloakUser,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Get the created user ID from Location header
      const location = response.headers.location;
      const userId = location.split('/').pop();

      logger.info(`User created in Keycloak: ${userId}`);

      return {
        keycloakUserId: userId,
        email: userData.email
      };
    } catch (error) {
      logger.error('Failed to create user in Keycloak:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update user in Keycloak
   */
  async updateUser(keycloakUserId, userData) {
    try {
      if (!this.isConfigured()) {
        logger.warn('Keycloak is not configured, skipping user update');
        return null;
      }

      const adminToken = await this.getAdminToken();

      const updateData = {};
      if (userData.firstName) updateData.firstName = userData.firstName;
      if (userData.lastName) updateData.lastName = userData.lastName;
      if (userData.email) updateData.email = userData.email;

      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`User updated in Keycloak: ${keycloakUserId}`);
      return true;
    } catch (error) {
      logger.error('Failed to update user in Keycloak:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUser(keycloakUserId) {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      const adminToken = await this.getAdminToken();

      await axios.delete(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      logger.info(`User deleted from Keycloak: ${keycloakUserId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete user from Keycloak:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Assign role to user in Keycloak
   */
  async assignRole(keycloakUserId, roleName) {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      const adminToken = await this.getAdminToken();

      // Get realm role
      const roleResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/roles/${roleName}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      const role = roleResponse.data;

      // Assign role to user
      await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakUserId}/role-mappings/realm`,
        [role],
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Role ${roleName} assigned to user ${keycloakUserId} in Keycloak`);
      return true;
    } catch (error) {
      logger.error('Failed to assign role in Keycloak:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get user by email from Keycloak
   */
  async getUserByEmail(email) {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const adminToken = await this.getAdminToken();

      const response = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users`,
        {
          params: {
            email: email,
            exact: true
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      logger.error('Failed to get user by email from Keycloak:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new KeycloakService();
