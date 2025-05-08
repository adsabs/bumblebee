import * as Yup from 'yup';
import {
  SubmitCorrectAbstractFormValues,
  Author,
  Url,
  UrlType,
  Collection,
  EntryType,
  Reference,
  Keyword,
} from '../models';

export function yupEnumField<T extends string | number>(
  values: readonly T[],
  required = false
): Yup.Schema<T> {
  const base = Yup.mixed<T>().oneOf([...values] as T[]);
  return required ? base.required() : base;
}

const authorSchema: Yup.ObjectSchema<Author> = Yup.object({
  id: Yup.string().required(),
  position: Yup.number().required(),
  name: Yup.string().required(),
  aff: Yup.string().required(),
  orcid: Yup.string().required(),
});

const urlSchema = Yup.object({
  type: yupEnumField(Object.values(UrlType)),
  value: Yup.string().required('URL value is required'),
}) as Yup.ObjectSchema<Url>;

const referenceSchema = Yup.object({
  type: yupEnumField(['bibcode', 'reference']),
  value: Yup.string().required('Reference value is required'),
}) as Yup.ObjectSchema<Reference>;

const keywordSchema = Yup.object({
  value: Yup.string().required(),
}) as Yup.ObjectSchema<Keyword>;

export const validationSchema: Yup.ObjectSchema<SubmitCorrectAbstractFormValues> = Yup.object({
  entryType: yupEnumField(Object.values(EntryType), true),

  name: Yup.string().required('Name is required'),

  email: Yup.string().email('Invalid email').required('Email is required'),

  collection: Yup.array(
    yupEnumField(Object.values(Collection), true)
  ) as Yup.ArraySchema<Collection>,

  bibcode: Yup.string(),

  title: Yup.string(),

  authors: Yup.array(authorSchema) as Yup.ArraySchema<Author>,

  publication: Yup.string().required('Publication information is required'),

  publicationDate: Yup.string()
    .matches(
      /^(?:\d{4}-(0[1-9]|1[0-2])|\d{4}-00(?:-00)?)$/,
      'Invalid date (should be in YYYY-MM format)'
    )
    .required('Publication date is required'),

  urls: Yup.array(urlSchema) as Yup.ArraySchema<Url>,

  abstract: Yup.string(),

  keywords: Yup.array(keywordSchema) as Yup.ArraySchema<Keyword>,

  references: Yup.array(referenceSchema) as Yup.ArraySchema<Reference>,

  comments: Yup.string().ensure(),

  recaptcha: Yup.string().ensure(),

  confirmNoAuthor: Yup.boolean().test(
    'confirmNoAuthor',
    'Please confirm, this abstract has no author(s)',
    function (value) {
      const hasAuthors = this?.parent?.authors?.length > 0;
      return (value && !hasAuthors) || (!value && hasAuthors);
    }
  ),
});
