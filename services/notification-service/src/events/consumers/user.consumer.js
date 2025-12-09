const emailService = require('../../services/email.service');
const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class UserConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      await eventBus.subscribe(
        'user.events',
        'notification.user.created',
        EVENT_TYPES.USER_CREATED,
        async (event) => {
          try {
            logger.info('User created event received in notification service', { userId: event.data.userId });
            await emailService.sendWelcomeEmail(event.data);
          } catch (error) {
            logger.error('Error processing user created event:', error);
          }
        }
      );

      logger.info('User consumers initialized');
    } catch (error) {
      logger.error('Failed to initialize user consumers:', error);
      throw error;
    }
  }
}

module.exports = new UserConsumer();
