import {ArrayChange, Change, diffArrays, diffWords} from 'diff';
import React from 'react';
import styled from 'styled-components';
import {SubmitCorrectAbstractFormValues} from '../models';

interface IDiffViewProps {
  left: SubmitCorrectAbstractFormValues;
  right: SubmitCorrectAbstractFormValues;
}

const DiffView: React.FC<IDiffViewProps> = React.memo(
  ({left, right}) => {
    const leftObj = processTree(left);
    const rightObj = processTree(right);

    const sections = Object.keys(leftObj).map((key) => {
      const isArray = Array.isArray(leftObj[key]);
      if (isArray && leftObj[key].length === 0) {
        return null;
      }
      let changes: (ArrayChange<string> | Change)[] = [];

      try {
        const leftVal = leftObj[key];
        const rightVal = rightObj[key];

        if (Array.isArray(leftVal) && Array.isArray(rightVal)) {
          changes = diffArrays(leftVal as string[], rightVal as string[]);
        } else if (typeof leftVal === 'string' && typeof rightVal === 'string') {
          changes = diffWords(leftVal, rightVal);
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }

      if (
        changes.length === 1 &&
        (changes[0].count === 0 || (!changes[0].added && !changes[0].removed))
      ) {
        return null;
      }

      return (
        <Section title={key} key={key}>
          {isArray ? (
            <ArrayChanges
              keyProp={key}
              changes={changes as ArrayChange<string>[]}
            />
          ) : (
            <TextChanges
              keyProp={key}
              changes={changes as Change[]}
              right={rightObj}
            />
          )}
        </Section>
      );
    });

    return (
      <>
        {sections.filter((s) => s).length > 0 ? (
          sections
        ) : (
          <Bold>No changes detected</Bold>
        )}
      </>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps) !== JSON.stringify(nextProps),
);

interface ITextChangeElementProps {
  keyProp: string;
  changes: Change[];
  right: ProcessedFormValues;
}

const TextChanges = ({keyProp, changes, right}: ITextChangeElementProps) => {
  return (
    <>
      <Bold>Diff:</Bold>
      {changes.reduce((list, change) => {
        if (change.added) {
          return [...list, <Add inline>{change.value}</Add>];
        } else if (change.removed) {
          return [...list, <Remove inline>{change.value}</Remove>];
        }
        return [...list, <Text inline>{change.value}</Text>];
      }, [] as React.ReactNode[])}
      <br/>
      <br/>
      <Bold>Updated:</Bold>
      <pre>{right[keyProp]}</pre>
    </>
  );
};

interface IArrayChangeElementProps {
  keyProp: string;
  changes: ArrayChange<string>[];
}

const ArrayChanges = ({keyProp, changes}: IArrayChangeElementProps) => {
  let i = 0;
  return (
    <>
      {changes.reduce((val, change) => {
        if (change.added) {
          const currentCount = i;
          i += change.count || 0;
          return [
            ...val,
            ...change.value.map((v, idx) => (
              <Add key={`${keyProp} ${idx + currentCount}`}>{`+ ${idx +
              currentCount +
              1} ${v}`}</Add>
            )),
          ];
        } else if (change.removed) {
          return [
            ...val,
            ...change.value.map((v, idx) => (
              <Remove key={`${keyProp} ${i + idx}`}>{`- ${i +
              idx +
              1} ${v}`}</Remove>
            )),
          ];
        }
        i += change.count || 0;
        return [...val, <Text key={`${keyProp} ${i}`}>...</Text>];
      }, [] as React.ReactNode[])}
    </>
  );
};

const Bold = styled.p`
  font-weight: bold;
`;

const Add = styled.p`
  color: green;
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const Remove = styled.p`
  color: red;
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const Text = styled.p`
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const SectionTitle = styled.div`
  text-transform: capitalize;
`;

const Section: React.FC<{ title: string }> = ({title, children}) => {
  return (
    <div className="panel panel-info">
      <SectionTitle className="panel-heading">{title}</SectionTitle>
      <div className="panel-body">{children}</div>
    </div>
  );
};

export interface ProcessedFormValues {
  affiliation: string[];
  authors: string[];
  keywords: string[];
  orcid: string[];
  collection: string[];
  urls: string[];
  references: string[];
  comments: string;
  publication: string;
  publicationDate: string;
  title: string;
  abstract: string;
  bibcode: string;
  [key: string]: string | string[];
}

export const processTree = (
  obj: SubmitCorrectAbstractFormValues,
): ProcessedFormValues => {
  const {
    comments = '',
    authors = [],
    collection = [],
    urls = [],
    keywords = [],
    references = [],
    publication = '',
    publicationDate = '',
    title = '',
    abstract = '',
    bibcode = '',
  } = obj;

  return {
    bibcode,
    comments,
    publication,
    publicationDate,
    title,
    abstract,
    keywords: keywords.map(({value}) => value),
    authors: authors.map((author) => author.name),
    affiliation: authors.map(({aff}) => aff),
    orcid: authors.map(({orcid}) => orcid),
    collection: collection.filter((c) => c).map((c) => c),
    urls: urls
      .filter(({value, type}) => type && value.length > 0)
      .map((u) => `${u.type ? `(${u.type}) ` : ''}${u.value}`),
    references: references
      .filter(({value}) => value.length > 0)
      .map((r) => `${r.type ? `(${r.type}) ` : ''}${r.value}`),
  };
};

export default DiffView;

// String-diff output

const strikeText = (str: string) => {
  return str
    .split('')
    .map((c) => c + '\u0336')
    .join('');
};

type FlattenedChange = {
  value: string;
  count: number;
  added?: boolean;
  removed?: boolean;
};

export const stringifyArrayChanges = (changes: ArrayChange<string>[]): string => {
  // Flatten array changes
  const entries: FlattenedChange[] = changes.reduce<FlattenedChange[]>((acc, change) => {
    return [
      ...acc,
      ...change.value.map((v) => ({
        count: 1,
        added: change.added,
        removed: change.removed,
        value: v,
      })),
    ];
  }, []);

  const out: string[] = [];
  let index = 1;

  for (let i = 0, j = 1; i < entries.length; i += 1, j = i + 1) {
    const count = entries[i].count || 1;

    if (
      count > 1 &&
      entries[i].removed &&
      entries[i + count] &&
      entries[i + count].count > 1 &&
      entries[i + count].added
    ) {
      out.push(`${index} ${strikeText(entries[i].value)}${entries[i + count].value}`);
      entries[i + count] = {
        count: entries[i + count].count,
        value: entries[i + count].value,
      };
      index += 1;
    } else if (entries[i].removed && entries[j] && entries[j].added) {
      out.push(`${index} ${strikeText(entries[i].value)}${entries[j].value}`);
      entries[j] = {
        count: entries[j].count,
        value: entries[j].value,
      };
      index += 1;
    } else if (entries[i].removed) {
      out.push(strikeText(`${index} ${entries[i].value}`));
      index += 1;
    } else if (entries[i].added) {
      out.push(`+ ${index} ${entries[i].value}`);
      index += 1;
    } else if (
      entries[i].count > 1 &&
      !entries[i].added &&
      !entries[i].removed
    ) {
      index += 1;
    }
  }

  return out.join('\n');
};

const stringifyWordChanges = (changes: Change[]) => {
  let didTruncate = false;
  const output = changes.reduce((acc: string, change) => {
    if (change.removed) {
      acc += strikeText(change.value);
    } else {
      if (change.value.length > 60) {
        didTruncate = true;
        acc += change.value.slice(0, 60);
      } else {
        acc += change.value;
      }
    }
    return acc;
  }, '');
  if (didTruncate) {
    return `...${output}...`;
  }
  return output;
};

export function createDiffString(
  left: SubmitCorrectAbstractFormValues,
  right: SubmitCorrectAbstractFormValues
): string {
  const leftObj = processTree(left);
  const rightObj = processTree(right);

  const sections = Object.keys(leftObj).map((key) => {
    const leftValue = leftObj[key];
    const rightValue = rightObj[key];

    // Skip if both values are undefined or empty arrays
    const isArray = Array.isArray(leftValue);
    if (isArray && (!Array.isArray(leftValue) || leftValue.length === 0)) {
      return null;
    }

    let changes: (ArrayChange<string> | Change)[] = [];

    try {
      if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
        changes = diffArrays(leftValue as string[], rightValue as string[]);
      } else if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        changes = diffWords(leftValue, rightValue);
      } else {
        // Incompatible types — skip diff
        return null;
      }
    } catch (e) {
      return null;
    }

    // If only one unchanged block, skip
    if (
      changes.length === 1 &&
      (changes[0].count === 0 || (!changes[0].added && !changes[0].removed))
    ) {
      return null;
    }

    const sectionTitle = key.charAt(0).toUpperCase() + key.slice(1);
    const diffOutput = isArray
      ? stringifyArrayChanges(changes as ArrayChange<string>[])
      : stringifyWordChanges(changes as Change[]);

    return `
>>>> ${sectionTitle}
${diffOutput}
<<<<`;
  });

  return sections.filter(Boolean).join('\n');
}
