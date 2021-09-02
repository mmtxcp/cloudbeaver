/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css } from 'reshadow';

import { useAdministrationSettings } from '@cloudbeaver/core-administration';
import {
  SubmittingForm,
  Loader,
  useFocus,
  ErrorMessage,
} from '@cloudbeaver/core-blocks';
import { useController } from '@cloudbeaver/core-di';
import { CommonDialogWrapper, DialogComponent } from '@cloudbeaver/core-dialogs';
import { composes, useStyles } from '@cloudbeaver/core-theming';

import { ConnectionAuthenticationForm } from '../ConnectionAuthentication/ConnectionAuthenticationForm';
import { useConnectionInfo } from '../useConnectionInfo';
import { useDBDriver } from '../useDBDriver';
import { DBAuthDialogController } from './DBAuthDialogController';
import { DBAuthDialogFooter } from './DBAuthDialogFooter';

const styles = composes(
  css`
    ErrorMessage {
      composes: theme-background-secondary theme-text-on-secondary from global;
    }
  `,
  css`
    SubmittingForm {
      overflow: auto;
      margin: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    ConnectionAuthenticationForm {
      align-content: center;
    }
    ErrorMessage {
      flex: 1;
    }
`);

interface Payload {
  connectionId: string;
  networkHandlers: string[];
}

export const DatabaseAuthDialog: DialogComponent<Payload> = observer(function DatabaseAuthDialog({
  payload,
  options,
  rejectDialog,
}) {
  const connection = useConnectionInfo(payload.connectionId);
  const controller = useController(DBAuthDialogController, payload.connectionId, rejectDialog);

  const { driver } = useDBDriver(connection.connectionInfo?.driverId || '');
  const { credentialsSavingEnabled } = useAdministrationSettings();
  const [focusedRef] = useFocus<HTMLFormElement>({ focusFirstChild: true });

  let authModelId: string | null = null;

  if (connection.connectionInfo?.authNeeded) {
    authModelId = connection.connectionInfo.authModel || driver?.defaultAuthModel || null;
  }

  return styled(useStyles(styles))(
    <CommonDialogWrapper
      size='large'
      title="connections_database_authentication"
      subTitle={connection.connectionInfo?.name}
      icon={driver?.icon}
      footer={(
        <DBAuthDialogFooter
          isAuthenticating={controller.isAuthenticating}
          onLogin={controller.login}
        >
          {controller.error.responseMessage && (
            <ErrorMessage
              text={controller.error.responseMessage}
              hasDetails={controller.error.hasDetails}
              onShowDetails={controller.showDetails}
            />
          )}
        </DBAuthDialogFooter>
      )}
      onReject={options?.persistent ? undefined : rejectDialog}
    >
      {(!connection.isLoaded() || connection.isLoading())
        ? <Loader />
        : (
          <SubmittingForm ref={focusedRef} onSubmit={controller.login}>
            <ConnectionAuthenticationForm
              config={controller.config}
              authModelId={authModelId}
              authProperties={connection.connectionInfo?.authProperties}
              networkHandlers={payload.networkHandlers}
              formId={payload.connectionId}
              allowSaveCredentials={credentialsSavingEnabled}
              disabled={controller.isAuthenticating}
            />
          </SubmittingForm>
        )}
    </CommonDialogWrapper>
  );
});
