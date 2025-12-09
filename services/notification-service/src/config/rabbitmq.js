const { getEventBus } = require('../../../../shared/events/eventBus');
const logger = require('../../../../shared/utils/logger');

let eventBus = null;

const connectEventBus = async () => {
  try {
    eventBus = await getEventBus();
    logger.info('RabbitMQ connected for notification-service');
    return eventBus;
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

const getEventBusInstance = () => {
  if (!eventBus) {
    throw new Error('EventBus not initialized. Call connectEventBus() first.');
  }
  return eventBus;
};

module.exports = {
  connectEventBus,
  getEventBusInstance
};
