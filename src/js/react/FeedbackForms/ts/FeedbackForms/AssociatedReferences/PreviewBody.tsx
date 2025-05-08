import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AssociatedArticlesFormValues, relationOptions } from '../models';

const getMainRelationString = (
  relation: AssociatedArticlesFormValues['relation'],
  customRelation: AssociatedArticlesFormValues['customRelation'],
) => {
  if (relation === 'other') {
    return customRelation;
  } else {
    const match = relationOptions.find((o) => o.key === relation);
    if (match) {
      return match.label;
    }
  }
  return '';
};

const getSecondaryRelationString = (
  relation: AssociatedArticlesFormValues['relation'],
) => {
  const match = relationOptions.find((o) => o.key === relation);
  if (match) {
    return match.secondaryLabel;
  }
  return 'related';
};

export const generatePreview = ({
  name,
  email,
  sourceBibcode,
  associated,
  customRelation,
  relation,
}: AssociatedArticlesFormValues) => {
  const preamble = `${sourceBibcode}`;
  const relationString = getMainRelationString(relation, customRelation);
  const associationString = getSecondaryRelationString(relation);

  return `From: ${name}
  Address: ${email}

  Correlated articles:

  ${relationString}${' '.repeat(
    Math.abs(23 - relationString.length),
  )}${associationString}
  ${preamble}${associated
    .map(({ bibcode }, idx) => {
      if (idx === 0) {
        return ` -> ${bibcode}`;
      }

      return `${' '.repeat(preamble.length)} -> ${bibcode}`;
    })
    .join('\n')}
  `;
};

const PreviewBody = () => {
  const { getValues } = useFormContext<AssociatedArticlesFormValues>();

  return <pre>{generatePreview(getValues())}</pre>;
};

export default PreviewBody;
