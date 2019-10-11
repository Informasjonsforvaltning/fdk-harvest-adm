/* eslint-disable @typescript-eslint/no-explicit-any */
import amqplib, { Channel, Connection } from 'amqplib';
import config from 'config';
import { DataSourceDocument } from '../data-source.model';

interface HarvestCatalogueMessage {
  publisherId: string;
  catalogueId: string;
  dataSourceType: string;
}

export interface MessageBroker {
  publishDataSource: (doc: DataSourceDocument) => void;
}

export const MOCK_MESSAGE_BROKER: MessageBroker = {
  publishDataSource: (): void => {}
};

export const createMessageBroker = async (): Promise<MessageBroker> => {
  const { user, pass, host, port, topic, exchange } = config.get('rabbitmq');
  const connectionUri = `amqp://${user}:${pass}@${host}:${port}`;

  const connection: Connection = await amqplib.connect(connectionUri);
  connection.on('error', console.error);
  const channel: Channel = await connection.createChannel();
  channel.assertExchange(exchange, 'direct', { durable: false });

  return {
    publishDataSource: ({
      dataSourceType = '',
      publisherId = ''
    }: DataSourceDocument): void => {
      const message: HarvestCatalogueMessage = {
        publisherId: publisherId,
        catalogueId: publisherId,
        dataSourceType: dataSourceType
      };

      channel.publish(exchange, topic, Buffer.from(JSON.stringify(message)));
    }
  };
};

// const { user, pass, host, port, exchange, topic } = config.get('rabbitmq');

// let channel: Channel;

// amqplib.connect(`amqp://${user}:${pass}@${host}:${port}`, (err, connection) => {
//   if (err) {
//     throw err;
//   }

//   connection.on('error', console.error);

//   connection.createChannel((err, ch) => {
//     if (err) {
//       throw err;
//     }

//     ch.assertExchange(exchange, 'direct', { durable: false });
//     channel = ch;
//   });
// });

// const publishDataSource = ({
//   dataSourceType = '',
//   publisherId = ''
// }: DataSourceDocument): void => {
//   const message: HarvestCatalogueMessage = {
//     publisherId: publisherId,
//     catalogueId: publisherId,
//     dataSourceType: dataSourceType
//   };

//   channel.publish(exchange, topic, Buffer.from(JSON.stringify(message)));
// };

// process.on('exit', () => {
//   channel.close(console.log);
// });
