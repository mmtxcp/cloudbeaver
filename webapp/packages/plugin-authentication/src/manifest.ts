/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { PluginManifest } from '@cloudbeaver/core-di';

import { AuthConfigurationFormService } from './Administration/IdentityProviders/AuthConfigurationFormService';
import { AuthConfigurationsAdministrationNavService } from './Administration/IdentityProviders/AuthConfigurationsAdministrationNavService';
import { AuthConfigurationsAdministrationService } from './Administration/IdentityProviders/AuthConfigurationsAdministrationService';
import { CreateAuthConfigurationService } from './Administration/IdentityProviders/CreateAuthConfigurationService';
import { AuthConfigurationOptionsTabService } from './Administration/IdentityProviders/Options/AuthConfigurationOptionsTabService';
import { CreateRoleService } from './Administration/Roles/CreateRoleService';
import { GrantedConnectionsTabService } from './Administration/Roles/GrantedConnections/GrantedConnectionsTabService';
import { GrantedUsersTabService } from './Administration/Roles/GrantedUsers/GrantedUsersTabService';
import { RoleOptionsTabService } from './Administration/Roles/Options/RoleOptionsTabService';
import { RoleFormService } from './Administration/Roles/RoleFormService';
import { RolesAdministrationNavService } from './Administration/Roles/RolesAdministrationNavService';
import { RolesAdministrationService } from './Administration/Roles/RolesAdministrationService';
import { ServerConfigurationAuthenticationBootstrap } from './Administration/ServerConfiguration/ServerConfigurationAuthenticationBootstrap';
import { CreateUserService } from './Administration/Users/CreateUserService';
import { UserFormBaseBootstrap } from './Administration/Users/UserForm/UserFormBaseBootstrap';
import { UserFormService } from './Administration/Users/UserForm/UserFormService';
import { UsersAdministrationNavigationService } from './Administration/Users/UsersAdministrationNavigationService';
import { UsersAdministrationService } from './Administration/Users/UsersAdministrationService';
import { AuthenticationLocaleService } from './AuthenticationLocaleService';
import { AuthenticationService } from './AuthenticationService';
import { AuthDialogService } from './Dialog/AuthDialogService';
import { PluginBootstrap } from './PluginBootstrap';
import { UserMenuService } from './UserMenu/UserMenuService';

export const manifest: PluginManifest = {
  info: {
    name: 'Authentication',
  },

  providers: [
    AuthenticationService,
    AuthDialogService,
    PluginBootstrap,
    UsersAdministrationService,
    AuthenticationLocaleService,
    CreateUserService,
    UsersAdministrationNavigationService,
    ServerConfigurationAuthenticationBootstrap,
    UserFormService,
    UserFormBaseBootstrap,
    UserMenuService,
    AuthConfigurationsAdministrationService,
    CreateAuthConfigurationService,
    AuthConfigurationsAdministrationNavService,
    AuthConfigurationFormService,
    AuthConfigurationOptionsTabService,
    RolesAdministrationService,
    CreateRoleService,
    RolesAdministrationNavService,
    RoleFormService,
    RoleOptionsTabService,
    GrantedUsersTabService,
    GrantedConnectionsTabService,
  ],
};
