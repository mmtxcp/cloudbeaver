/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';

import type { ObjectPropertyInfo } from '@cloudbeaver/core-sdk';

import { FieldCheckboxNew } from '../../FormControls/Checkboxes/FieldCheckboxNew';
import { ComboboxNew } from '../../FormControls/ComboboxNew';
import { FormFieldDescriptionNew } from '../../FormControls/FormFieldDescriptionNew';
import { InputFieldNew } from '../../FormControls/InputFieldNew';
import { isControlPresented } from '../../FormControls/isControlPresented';
import { TextareaNew } from '../../FormControls/TextareaNew';
import { Link } from '../../Link';

const RESERVED_KEYWORDS = ['no', 'off', 'new-password'];

interface RenderFieldProps {
  property: ObjectPropertyInfo;
  state?: Record<string, any>;
  editable?: boolean;
  autofillToken?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoHide?: boolean;
  showRememberTip?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

type ControlType = 'checkbox' | 'combobox' | 'link' | 'input' | 'textarea';

function getControlTypeFor(property: ObjectPropertyInfo): ControlType {
  const dataType = property.dataType?.toLowerCase();

  if (dataType === 'boolean') {
    return 'checkbox';
  } else if (property.validValues && property.validValues.length > 0) {
    return 'combobox';
  } else if (property.features.includes('href')) {
    return 'link';
  } else if (dataType === 'string' && property.length === 'MULTILINE') {
    return 'textarea';
  }

  return 'input';
}

function getValue(value: any, controlType: ControlType) {
  const checkbox = controlType === 'checkbox';

  if (value === null || value === undefined) {
    return checkbox ? false : '';
  }

  if (typeof value === 'string') {
    return checkbox ? value.toLowerCase() === 'true' : value;
  }

  return value.displayName || value.value || JSON.stringify(value);
}

export const RenderField = observer<RenderFieldProps>(function RenderField({
  property,
  state,
  editable = true,
  autofillToken = '',
  disabled,
  readOnly,
  autoHide,
  showRememberTip,
  onFocus,
  className,
}) {
  const controltype = getControlTypeFor(property);
  const password = property.features.includes('password');

  const value = getValue(property.value, controltype);
  const defaultValue = getValue(property.defaultValue, controltype);
  let description: string | undefined;

  if (controltype === 'link') {
    return (
      <FormFieldDescriptionNew label={property.displayName} className={className}>
        <Link href={state?.[property.id!]} target='_blank' rel='noopener noreferrer'>{property.description}</Link>
      </FormFieldDescriptionNew>
    );
  }

  if (!editable) {
    if (autoHide && !isControlPresented(property.id!, state)) {
      return null;
    }
    return (
      <FormFieldDescriptionNew title={property.description} label={property.displayName} className={className}>
        {state?.[property.id!]}
      </FormFieldDescriptionNew>
    );
  }

  if (showRememberTip && password && property.value) {
    description = 'Password saved';
  }

  if (controltype === 'checkbox') {
    if (state !== undefined) {
      return (
        <FieldCheckboxNew
          id={property.id}
          name={property.id!}
          state={state}
          defaultChecked={defaultValue}
          title={property.description}
          disabled={disabled || readOnly}
          className={className}
        >
          {property.displayName ?? ''}
        </FieldCheckboxNew>
      );
    }
    return (
      <FieldCheckboxNew
        id={property.id}
        name={property.id!}
        checked={value}
        defaultChecked={defaultValue}
        title={property.description}
        disabled={disabled || readOnly}
        className={className}
      >
        {property.displayName ?? ''}
      </FieldCheckboxNew>
    );
  }

  if (controltype === 'combobox') {
    if (state !== undefined) {
      return (
        <ComboboxNew
          name={property.id!}
          state={state}
          items={property.validValues!}
          keySelector={value => value}
          valueSelector={value => value}
          defaultValue={defaultValue}
          title={property.description}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
        >
          {property.displayName ?? ''}
        </ComboboxNew>
      );
    }

    return (
      <ComboboxNew
        name={property.id!}
        items={property.validValues!}
        keySelector={value => value}
        valueSelector={value => value}
        defaultValue={defaultValue}
        title={property.description}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
      >
        {property.displayName ?? ''}
      </ComboboxNew>
    );
  }

  if (controltype === 'textarea') {
    if (state !== undefined) {
      return (
        <TextareaNew
          title={property.description}
          name={property.id!}
          state={state}
          disabled={disabled}
          readOnly={readOnly}
          mod='surface'
          className={className}
        >
          {property.displayName ?? ''}
        </TextareaNew>
      );
    }

    return (
      <TextareaNew
        title={property.description}
        name={property.id!}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        mod='surface'
        className={className}
      >
        {property.displayName ?? ''}
      </TextareaNew>
    );
  }

  if (state !== undefined) {
    return (
      <InputFieldNew
        type={password ? 'password' : 'text'}
        title={property.description}
        name={property.id!}
        state={state}
        defaultValue={defaultValue}
        description={description}
        disabled={disabled}
        readOnly={readOnly}
        autoHide={autoHide}
        autoComplete={RESERVED_KEYWORDS.includes(autofillToken) ? autofillToken : `${autofillToken} ${property.id}`}
        mod='surface'
        className={className}
        onFocus={onFocus}
      >
        {property.displayName}
      </InputFieldNew>
    );
  }
  return (
    <InputFieldNew
      type={password ? 'password' : 'text'}
      title={property.description}
      name={property.id!}
      value={value}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete={RESERVED_KEYWORDS.includes(autofillToken) ? autofillToken : `${autofillToken} ${property.id}`}
      mod='surface'
      className={className}
      onFocus={onFocus}
    >
      {property.displayName}
    </InputFieldNew>
  );
});
