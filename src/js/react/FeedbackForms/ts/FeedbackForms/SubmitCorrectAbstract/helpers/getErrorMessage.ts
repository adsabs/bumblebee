import { FieldErrors } from 'react-hook-form';

export function getErrorMessage<
  FormValues extends Record<string, any>,
  FieldKey extends keyof FormValues,
  InnerKey extends keyof FormValues[FieldKey][number] & string
>(
  errors: FieldErrors<FormValues>,
  index: number,
  field: FieldKey,
  innerField: InnerKey
): string | undefined {
  const fieldErrors = errors?.[field];

  if (
    Array.isArray(fieldErrors) &&
    fieldErrors[index] &&
    (fieldErrors[index] as any)[innerField] &&
    (fieldErrors[index] as any)[innerField].message
  ) {
    return (fieldErrors[index] as any)[innerField].message;
  }

  return undefined;
}
