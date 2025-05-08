import { apiFetch, ApiTarget } from '../../api';
import { SubmitCorrectAbstractFormValues, Url } from '../../models';

// lodash should be a global on the page
declare var _: any;

export type FullRecord = Omit<
  SubmitCorrectAbstractFormValues,
  | 'entryType'
  | 'name'
  | 'email'
  | 'objects'
  | 'references'
  | 'comments'
  | 'recaptcha'
>;

const SKIP_URLS = [
  'http://www.cfa.harvard.edu/sao',
  'https://www.cfa.harvard.edu/',
  'http://www.si.edu',
  'http://www.nasa.gov',
];

/**
 * Scrape the ESOURCE endpoint for URLs listed for this entity
 * TODO: Currently filters out header and footer links, but should find a better way to
 * do this in the future.
 *
 * @param identifier Bibcode or other article identifier
 * @returns Array of URL objects including type and URL
 */
const getUrls = async (identifier: string): Promise<Url[]> => {
  // url regex, skip internal links
  const reg = /href="(https?:\/\/[^"]*)"/gi;
  try {
    const body = await fetch(`link_gateway/${encodeURIComponent(identifier)}/ESOURCE`);
    const raw = await body.text();
    if (raw) {
      return (
        Array.from(
          new Set(raw.matchAll(reg)),
          (e) =>
            ({
              type: e[1].includes('arxiv')
                ? 'arxiv'
                : e[1].includes('pdf')
                  ? 'pdf'
                  : e[1].includes('doi')
                    ? 'doi'
                    : 'html',
              value: e[1],
            } as Url),
        )
          .slice(1)

          // filter out urls based on a skip list
          .filter((url) => !SKIP_URLS.includes(url.value))
      );
    }
  } catch (e) {
    // do not handle
  }
  return [];
};

const fetchFullRecord = _.memoize(
  async ([identifier]: [string]): Promise<FullRecord> => {
    if (identifier.length === 0) {
      throw new Error('Empty bibcode');
    }

    const response = await apiFetch({
      target: ApiTarget.SEARCH,
      query: {
        fl:
          'title,author,aff,pub_raw,pubdate,abstract,volume,bibcode,keyword,orcid_pub,database',
        q: `identifier:${identifier}`,
        rows: 1,
      },
    });

    const urls = await getUrls(identifier);

    if (response.response?.docs?.length > 0) {
      const {
        title = [],
        pub_raw: publication = '',
        pubdate: publicationDate = '',
        abstract = '',
        bibcode = '',
        keyword: keywords = [],
        author = [],
        aff = [],
        orcid_pub = [],
        database = []
      } = response.response.docs[0];

      const authors = author.map((name, position) => ({
        id: `${name}_${position}`,
        position,
        name,
        aff: aff[position] !== '-' ? aff[position] : '',
        orcid: orcid_pub[position] !== '-' ? orcid_pub[position] : '',
      }));

      return {
        title: title[0],
        publication,
        publicationDate,
        abstract,
        bibcode,
        authors,
        collection: database,
        keywords: keywords.map((k) => ({ value: k })),
        urls,
        confirmNoAuthor: false,
      };
    }

    throw new Error('No Result for this bibcode');
  },
);

export default fetchFullRecord;
