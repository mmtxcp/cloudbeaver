/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import styled from 'reshadow';

import { AuthProviderService, AuthProvidersResource, AUTH_PROVIDER_LOCAL_ID } from '@cloudbeaver/core-authentication';
import { BASE_CONTAINERS_STYLES, Container, FormContext, Group, GroupTitle, Loader, PlaceholderComponent, SwitchNew, useExecutor, useMapResource } from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';
import { useTranslate } from '@cloudbeaver/core-localization';
import { CachedMapAllKey } from '@cloudbeaver/core-sdk';
import { useStyles } from '@cloudbeaver/core-theming';
import type { IConfigurationPlaceholderProps } from '@cloudbeaver/plugin-administration';

import { ServerConfigurationAdminForm } from './ServerConfigurationAdminForm';

export const AuthenticationProviders: PlaceholderComponent<IConfigurationPlaceholderProps> = observer(function AuthenticationProviders({
  state: { serverConfig },
  configurationWizard,
}) {
  const authProviderService = useService(AuthProviderService);
  const providers = useMapResource(AuthenticationProviders, AuthProvidersResource, CachedMapAllKey);
  const translate = useTranslate();
  const styles = useStyles(BASE_CONTAINERS_STYLES);
  const formContext = useContext(FormContext);

  if (formContext === null) {
    throw new Error('Form state should be provided');
  }

  const localProvider = providers.resource.get(AUTH_PROVIDER_LOCAL_ID);
  const services = providers.resource.values.filter(provider => provider.id !== AUTH_PROVIDER_LOCAL_ID);
  const externalAuthentication = providers.data.length === 1 && localProvider === undefined;
  const authenticationDisabled = serverConfig.enabledAuthProviders?.length === 0;

  useExecutor({
    executor: formContext.changeExecutor,
    handlers: [function switchControls() {
      if (serverConfig.enabledAuthProviders?.length === 0) {
        serverConfig.anonymousAccessEnabled = true;
      }
    }],
  });

  if (externalAuthentication) {
    return null;
  }

  return styled(styles)(
    <Container wrap gap>
      {localProvider && (
        <>
          <Group key='authentication' form gap medium>
            <GroupTitle>{translate('administration_configuration_wizard_configuration_authentication_group')}</GroupTitle>
            <SwitchNew
              name="anonymousAccessEnabled"
              state={serverConfig}
              description={translate('administration_configuration_wizard_configuration_anonymous_access_description')}
              mod={['primary']}
              disabled={authenticationDisabled}
              small
              autoHide
            >
              {translate('administration_configuration_wizard_configuration_anonymous_access')}
            </SwitchNew>
            <Loader state={providers} inline>
              {() => localProvider && styled(styles)(
                <SwitchNew
                  key={localProvider.id}
                  value={localProvider.id}
                  name="enabledAuthProviders"
                  state={serverConfig}
                  description={localProvider.description}
                  mod={['primary']}
                  small
                  autoHide
                >
                  {localProvider.label}
                </SwitchNew>
              )}
            </Loader>
          </Group>
          {configurationWizard && (
            <ServerConfigurationAdminForm serverConfig={serverConfig} />
          )}
        </>
      )}
      {services.length > 0 ? (
        <Group key='services' form gap medium>
          <GroupTitle>{translate('administration_configuration_wizard_configuration_services')}</GroupTitle>
          <Loader state={providers} inline>
            {() => styled(styles)(
              <>
                {services.map(provider => {
                  const links = authProviderService.getServiceDescriptionLinks(provider);

                  return (
                    <SwitchNew
                      key={provider.id}
                      value={provider.id}
                      name="enabledAuthProviders"
                      state={serverConfig}
                      description={(
                        <>
                          {provider.description}
                          {links.map(link => {
                            const Description = link.description();
                            return <Description key={link.id} configurationWizard={configurationWizard} />;
                          })}
                        </>
                      )}
                      disabled={providers.resource.isBase(provider.id)}
                      mod={['primary']}
                      small
                      autoHide
                    >
                      {provider.label}
                    </SwitchNew>
                  );
                })}
              </>
            )}
          </Loader>
        </Group>
      ) : <Container medium />}
      {!(configurationWizard && localProvider) && <Container medium />}
    </Container>
  );
});
