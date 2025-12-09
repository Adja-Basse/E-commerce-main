const amqp = require('amqplib');
const logger = require('../utils/logger');
const { EVENT_TYPES } = require('./eventTypes');

class EventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchanges = new Map();
    this.queues = new Map();
    this.subscribers = new Map();
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      logger.info('Connected to RabbitMQ');
      
      // Setup exchanges
      await this.setupExchanges();
      
      return this;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async setupExchanges() {
    const exchanges = [
      'user.events',
      'order.events',
      'payment.events',
      'stock.events',
      'cart.events',
      'return.events',
      'notification.events'
    ];

    for (const exchange of exchanges) {
      await this.channel.assertExchange(exchange, 'topic', {
        durable: true
      });
      this.exchanges.set(exchange, true);
      logger.info(`Exchange '${exchange}' asserted`);
    }
  }

  async publish(exchange, routingKey, event, options = {}) {
    try {
      if (!this.channel) {
        throw new Error('EventBus not connected. Call connect() first.');
      }

      const message = {
        type: event.type || routingKey,
        data: event.data || event,
        timestamp: new Date().toISOString(),
        source: process.env.SERVICE_NAME || 'unknown',
        ...options.metadata
      };

      const buffer = Buffer.from(JSON.stringify(message));
      
      const published = this.channel.publish(
        exchange,
        routingKey,
        buffer,
        {
          persistent: true,
          ...options
        }
      );

      if (published) {
        logger.info(`Published event: ${routingKey} to ${exchange}`, { event: message.type });
      } else {
        logger.warn(`Failed to publish event: ${routingKey} - channel buffer full`);
      }

      return published;
    } catch (error) {
      logger.error(`Error publishing event ${routingKey}:`, error);
      throw error;
    }
  }

  async subscribe(exchange, queue, routingKey, handler, options = {}) {
    try {
      if (!this.channel) {
        throw new Error('EventBus not connected. Call connect() first.');
      }

      // Assert queue
      const queueOptions = {
        durable: true,
        ...options.queue
      };
      
      const assertedQueue = await this.channel.assertQueue(queue, queueOptions);
      this.queues.set(queue, assertedQueue);

      // Bind queue to exchange
      await this.channel.bindQueue(queue, exchange, routingKey);
      logger.info(`Queue '${queue}' bound to exchange '${exchange}' with routing key '${routingKey}'`);

      // Consume messages
      await this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              logger.info(`Received event: ${content.type}`, { queue, routingKey });

              // Execute handler
              await handler(content);

              // Acknowledge message
              this.channel.ack(msg);
            } catch (error) {
              logger.error(`Error processing message from queue ${queue}:`, error);
              
              // Reject and requeue or send to DLQ
              if (options.maxRetries && (msg.properties.headers?.['x-retry-count'] || 0) < options.maxRetries) {
                const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
                this.channel.nack(msg, false, true);
                logger.warn(`Message requeued (retry ${retryCount}/${options.maxRetries})`);
              } else {
                this.channel.nack(msg, false, false);
                logger.error(`Message rejected after max retries`);
              }
            }
          }
        },
        {
          noAck: false,
          ...options.consume
        }
      );

      // Store subscriber info
      if (!this.subscribers.has(queue)) {
        this.subscribers.set(queue, []);
      }
      this.subscribers.get(queue).push({ exchange, routingKey, handler });

      logger.info(`Subscribed to queue '${queue}' with routing key '${routingKey}'`);
    } catch (error) {
      logger.error(`Error subscribing to queue ${queue}:`, error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('EventBus connection closed');
    } catch (error) {
      logger.error('Error closing EventBus connection:', error);
      throw error;
    }
  }

  isConnected() {
    return this.connection !== null && !this.connection.connection.destroyed;
  }
}

// Singleton instance
let eventBusInstance = null;

const getEventBus = async () => {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
    await eventBusInstance.connect();
  }
  return eventBusInstance;
};

module.exports = {
  EventBus,
  getEventBus
};

