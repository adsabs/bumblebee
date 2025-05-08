export interface ReduxState {
  main: {
    bibcode: string;
  };
  user: {
    email: string;
    bibcode: string;
  };
}

export type RelationOption = {
  key: string;
  text: string;
  label: string;
  secondaryLabel: string;
};

export const relationOptions: RelationOption[] = [
  {
    key: 'errata',
    text: 'Main paper/Errata',
    label: 'Main Paper',
    secondaryLabel: 'Errata',
  },
  {
    key: 'addenda',
    text: 'Main paper/Addenda',
    label: 'Main Paper',
    secondaryLabel: 'Addenda',
  },
  {
    key: 'series',
    text: 'Series of articles',
    label: 'Main Paper',
    secondaryLabel: 'Series of articles',
  },
  {
    key: 'arxiv',
    text: 'arXiv/Published',
    label: 'arXiv',
    secondaryLabel: 'Main Paper',
  },
  {
    key: 'duplicate',
    text: 'Duplicate',
    label: 'Main Paper',
    secondaryLabel: 'Duplicate',
  },
  { key: 'other', text: 'Other', label: '', secondaryLabel: 'Related' },
];

export type UrlOption = {
  key: string;
  text: string;
};

export const urlOptions: UrlOption[] = [
  { key: 'arxiv', text: 'arXiv' },
  { key: 'pdf', text: 'PDF' },
  { key: 'doi', text: 'DOI' },
  { key: 'html', text: 'HTML' },
  { key: 'other', text: 'OTHER' },
];

export type ReferenceOption = {
  key: string;
  text: string;
};

export const referenceOptions: ReferenceOption[] = [
  { key: 'bibcode', text: 'Bibcode' },
  { key: 'reference', text: 'Reference' },
];

export type AssociatedArticlesFormValues = {
  name: string;
  email: string;
  relation: 'none' | 'errata' | 'addenda' | 'series' | 'arxiv' | 'other';
  customRelation: string;
  sourceBibcode: string;
  associated: { bibcode: string }[];
  recaptcha: string;
};

export type BibcodeItem = {
  citing: string;
  cited: string;
};

export type MissingIncorrectRecordFormValues = {
  name: string;
  email: string;
  bibcodes: BibcodeItem[];
  recaptcha: string;
};

export type Author = {
  id: string;
  position: number;
  name: string;
  aff: string;
  orcid: string;
};

export enum UrlType {
  PDF = 'pdf',
  DOI = 'doi',
  HTML = 'html',
  OTHER = 'other',
  ARXIV = 'arxiv',
}

export type Url = {
  type?: UrlType;
  value: string;
};

export type Reference = {
  type?: 'bibcode' | 'reference';
  value: string;
};

export type Keyword = {
  value: string;
};

export enum Collection {
  Astronomy = 'astronomy',
  Physics = 'physics',
  EarthScience = 'earth science',
  General = 'general',
}

export const collectionOptions: { key: Collection; label: string }[] = [
  { key: Collection.Astronomy, label: 'Astronomy and Astrophysics' },
  { key: Collection.Physics, label: 'Physics and Geophysics' },
  { key: Collection.EarthScience, label: 'Earth Science' },
  { key: Collection.General, label: 'General' },
];

export enum EntryType {
  New = 'new',
  Edit = 'edit',
}

export const entryTypeOptions: { key: EntryType; label: string }[] = [
  { key: EntryType.New, label: 'New Record' },
  { key: EntryType.Edit, label: 'Edit Record' },
];

export type SubmitCorrectAbstractFormValues = {
  entryType: EntryType;
  name: string;
  email: string;
  collection: Collection[];
  bibcode: string;
  title: string;
  authors: Author[];
  publication: string;
  publicationDate: string;
  urls: Url[];
  abstract: string;
  keywords: Keyword[];
  references: Reference[];
  comments: string;
  recaptcha: string;
  confirmNoAuthor: boolean;
};
