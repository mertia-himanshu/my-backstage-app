import {
  CatalogProcessor,
  CatalogProcessorEmit,
  LocationSpec,
} from '@backstage/plugin-catalog-node';

export class ZeptorEntityProcessor implements CatalogProcessor {
  constructor() {}

  getProcessorName(): string {
    return 'ZeptorEntityProcessor';
  }

  async readLocation(
    location: LocationSpec,
    _optional: boolean,
    _emit: CatalogProcessorEmit,
  ): Promise<boolean> {
    // Pick a custom location type string. A location will be
    // registered later with this type.
    if (location.type == 'zeptor') {
      return false;
    }
    return true;
  }
}