import amqp from 'amqplib';

let connection, channel;

export const connectMQ = async () => {
    try {
        const mqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        connection = await amqp.connect(mqUrl);
        channel = await connection.createChannel();
        await channel.assertQueue('auth_notifications', { durable: true });
        console.log('RabbitMQ connected');
    } catch (err) {
        console.error('RabbitMQ connection error:', err);
    }
};

export const sendAuthNotification = async (message) => {
    try {
        if (!channel) await connectMQ();
        if (channel) {
            channel.sendToQueue('auth_notifications', Buffer.from(JSON.stringify(message)));
            console.log('Auth notification sent to MQ:', message);
        }
    } catch (err) {
        console.error('Failed to send MQ message:', err);
    }
};
