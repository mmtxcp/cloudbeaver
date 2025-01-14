/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { injectable } from '@cloudbeaver/core-di';
import { SessionDataResource } from '@cloudbeaver/core-root';
import type { AuthProviderConfiguration, UserInfo } from '@cloudbeaver/core-sdk';
import { openCenteredPopup } from '@cloudbeaver/core-utils';

import { AuthProvidersResource } from './AuthProvidersResource';
import { UserInfoResource } from './UserInfoResource';

@injectable()
export class AuthInfoService {
  get userInfo(): UserInfo | null {
    return this.userInfoResource.data;
  }

  get userAuthConfigurations(): AuthProviderConfiguration[] {
    const tokens = this.userInfo?.authTokens;
    const result: AuthProviderConfiguration[] = [];

    if (!tokens) {
      return result;
    }

    for (const token of tokens) {
      if (token.authConfiguration) {
        const provider = this.authProvidersResource.values.find(
          provider => provider.id === token.authProvider
        );

        if (provider) {
          const configuration = provider.configurations?.find(
            configuration => configuration.id === token.authConfiguration
          );

          if (configuration) {
            result.push(configuration);
          }
        }
      }
    }

    return result;
  }

  private activeSSO: Promise<UserInfo | null> | null;

  constructor(
    private readonly userInfoResource: UserInfoResource,
    private readonly authProvidersResource: AuthProvidersResource,
    private readonly sessionDataResource: SessionDataResource
  ) {
    this.activeSSO = null;
  }

  async login(provider: string, credentials: Record<string, string>, link?: boolean): Promise<UserInfo | null> {
    return this.userInfoResource.login(provider, credentials, link);
  }

  async sso(providerId: string, configuration: AuthProviderConfiguration): Promise<UserInfo | null> {
    if (!this.activeSSO) {
      this.activeSSO = this.ssoAuth(providerId, configuration);
    }

    try {
      return await this.activeSSO;
    } finally {
      this.activeSSO = null;
    }
  }

  async logout(): Promise<void> {
    await this.userInfoResource.logout();
  }

  private async ssoAuth(providerId: string, configuration: AuthProviderConfiguration): Promise<UserInfo | null> {
    const popup = openCenteredPopup(configuration.signInLink, configuration.displayName, 600, 700);

    if (popup) {
      popup.focus();
      await this.waitWindowsClose(popup);
      const user = await this.userInfoResource.refresh();
      await this.sessionDataResource.refresh();
      return user;
    }

    return null;
  }

  private async waitWindowsClose(window: Window): Promise<void> {
    return new Promise(resolve => {
      setInterval(() => {
        if (window.closed) {
          resolve();
        }
      }, 100);
    });
  }
}
