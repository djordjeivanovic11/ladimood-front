'use client';

import PhoneInput, { type PhoneInputProps } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { normalizePhoneNumber } from '@/lib/phone';
import { cn } from '@/lib/utils';

type PhoneNumberInputProps = Omit<
  PhoneInputProps,
  'inputClass' | 'buttonClass' | 'containerClass' | 'dropdownClass'
> & {
  containerClassName?: string;
  hasError?: boolean;
};

export function PhoneNumberInput({
  containerClassName,
  hasError,
  country = 'me',
  onChange,
  ...props
}: PhoneNumberInputProps) {
  return (
    <PhoneInput
      country={country}
      countryCodeEditable={false}
      enableSearch
      onChange={(value, data, event, formattedValue) => {
        onChange?.(normalizePhoneNumber(value), data, event, formattedValue);
      }}
      containerClass={cn('ladimood-phone-input', containerClassName)}
      inputClass={cn(
        'ladimood-phone-input__field',
        hasError && 'ladimood-phone-input__field--error'
      )}
      buttonClass={cn(
        'ladimood-phone-input__button',
        hasError && 'ladimood-phone-input__button--error'
      )}
      dropdownClass="ladimood-phone-input__dropdown"
      {...props}
    />
  );
}
