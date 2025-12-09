const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class UserPublisher {
  /**
   * Publish user created event
   */
  async publishUserCreated(userData) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'user.events',
        EVENT_TYPES.USER_CREATED,
        {
          type: EVENT_TYPES.USER_CREATED,
          data: userData
        }
      );
      logger.info('User created event published', { userId: userData.userId });
    } catch (error) {
      logger.error('Failed to publish user created event:', error);
      throw error;
    }
  }

  /**
   * Publish user updated event
   */
  async publishUserUpdated(userData) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'user.events',
        EVENT_TYPES.USER_UPDATED,
        {
          type: EVENT_TYPES.USER_UPDATED,
          data: userData
        }
      );
      logger.info('User updated event published', { userId: userData.userId });
    } catch (error) {
      logger.error('Failed to publish user updated event:', error);
      throw error;
    }
  }

  /**
   * Publish user logged in event
   */
  async publishUserLoggedIn(userData) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'user.events',
        EVENT_TYPES.USER_LOGGED_IN,
        {
          type: EVENT_TYPES.USER_LOGGED_IN,
          data: userData
        }
      );
      logger.info('User logged in event published', { userId: userData.userId });
    } catch (error) {
      logger.error('Failed to publish user logged in event:', error);
      throw error;
    }
  }
}

module.exports = new UserPublisher();

