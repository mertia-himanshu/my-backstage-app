import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { ZeptorEntityProcessor } from './zeptorEntityProcessor';
import { ZeptorEntityProvider } from './zeptorEntityProvider';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new ZeptorEntityProcessor());
  builder.addEntityProvider(new ZeptorEntityProvider(env));
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
