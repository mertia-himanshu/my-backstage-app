import { Entity } from '@backstage/catalog-model';
import {
    EntityProvider,
    EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { PluginEnvironment } from '../types';
import { Consumer, Kafka } from 'kafkajs';

/**
 * Provides entities from fictional frobs service.
 */
export class ZeptorEntityProvider implements EntityProvider {

    private connection?: EntityProviderConnection;
    private consumer: Consumer;

    /** [1] **/
    constructor(readonly env: PluginEnvironment) {

        const config = env.config;
        const kafka = new Kafka({
            clientId: config.getString('zeptor.clientId'),
            brokers: config.getStringArray('zeptor.brokers'),
        })

        this.consumer = kafka.consumer({ groupId: config.getString('zeptor.groupId') });

    }

    /** [2] **/
    getProviderName(): string {
        return 'zeptorEntityProvider';
    }

    /** [3] **/
    async connect(connection: EntityProviderConnection): Promise<void> {
        this.connection = connection;
        await this.consumer.connect()
        await this.consumer.subscribe({ topic: this.env.config.getString('zeptor.topic'), fromBeginning: true })

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                let value: Entity;
                value = JSON.parse(message?.value?.toString()!)
                console.log(value.apiVersion)
                console.log(value.metadata.name)
                console.log(value.kind)

                if(value.spec?._type =="add"){
                await this.connection?.applyMutation({
                    type: 'delta',
                    added: [{
                        entity: value,
                        locationKey: `zeptorEntityProvider:${value.metadata.name}`,
                    }],
                    removed: []
                });
            }
            else{
                await this.connection?.applyMutation({
                    type: 'delta',
                    added: [],
                    removed: [{
                        entity: value,
                        locationKey: `zeptorEntityProvider:${value.metadata.name}`,
                    }]
                });
            }
            },
        })

    }
   
}