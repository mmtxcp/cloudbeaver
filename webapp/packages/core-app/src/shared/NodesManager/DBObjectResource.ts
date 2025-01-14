/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { injectable } from '@cloudbeaver/core-di';
import {
  GraphQLService, CachedMapResource, ResourceKey, isResourceKeyList, resourceKeyList
} from '@cloudbeaver/core-sdk';

import type { DBObject } from './EntityTypes';
import { NavNodeInfoResource } from './NavNodeInfoResource';

@injectable()
export class DBObjectResource extends CachedMapResource<string, DBObject> {
  constructor(
    private graphQLService: GraphQLService,
    private navNodeInfoResource: NavNodeInfoResource
  ) {
    super();

    // this.preloadResource(this.navNodeInfoResource);
    this.navNodeInfoResource.outdateResource(this);
    this.navNodeInfoResource.deleteInResource(this);
  }

  async loadChildren(parentId: string, key: ResourceKey<string>): Promise<Map<string, DBObject>> {
    await this.performUpdate(
      key,
      [],
      () => this.loadFromChildren(parentId),
      () => this.isLoaded(key) && !this.isOutdated(key)
    );

    return this.data;
  }

  protected async loader(key: ResourceKey<string>): Promise<Map<string, DBObject>> {
    if (isResourceKeyList(key)) {
      const values: DBObject[] = [];
      for (const navNodeId of key.list) {
        values.push(await this.loadDBObjectInfo(navNodeId));
      }
      this.set(key, values);
    } else {
      this.set(key, await this.loadDBObjectInfo(key));
    }

    return this.data;
  }

  private async loadFromChildren(parentId: string) {
    const { dbObjects } = await this.graphQLService.sdk.getChildrenDBObjectInfo({
      navNodeId: parentId,
    });

    this.set(resourceKeyList(dbObjects.map(dbObject => dbObject.id)), dbObjects);
  }

  private async loadDBObjectInfo(navNodeId: string): Promise<DBObject> {
    const { objectInfo } = await this.graphQLService.sdk.getDBObjectInfo({
      navNodeId,
    });

    return objectInfo;
  }
}
