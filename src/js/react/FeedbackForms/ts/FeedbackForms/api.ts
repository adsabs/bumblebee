import {PubSubEvent} from '../hooks';
import {Collection} from './models';

type BumblebeeApp = any;
declare var bbb: BumblebeeApp;
type ArticleRecord = {
  id: string;
  bibcode: string;
  title: string[];
  abstract: string;
  author: string[];
  pub: string;
  pub_raw: string;
  pubdate: string;
  comment: string;
  keyword: string[];
  pubnote: string;
  aff: string[];
  orcid_pub: string[];
  database: Collection[]
};

export type JSONResponse = {
  export: string;
  response: {
    docs: ArticleRecord[];
    numFound: number;
  };
};

type Query = {
  q: string;
  fl: string;
  rows: number;
};

interface IApiFetchProps {
  options?: any;
  target: string;
  query?: Query;
}

export interface AjaxError {
  status: number;
  statusText: string;
  responseJSON: {
    error: string;
    message: string;
  };
}
export function isAjaxError(e: any): e is AjaxError {
  return typeof e === 'object' && ('responseJSON' in e || 'status' in e);
}

export const apiFetch = (props: IApiFetchProps): Promise<JSONResponse> => {
  const {options, target, query} = props;

  const bumblebeeGlobal = bbb ? bbb : null;
  return new Promise<JSONResponse>((resolve, reject) => {
    const ps = bumblebeeGlobal.__beehive.getService('PubSub');
    const {makeApiQuery, makeApiRequest} = bumblebeeGlobal.getObject('Utils');
    const request = makeApiRequest({
      target,
      query: makeApiQuery(query),
    });

    request.set('options', {
      done: (...args: any[]) => {
        // @ts-ignore
        resolve(...args);
      },
      fail: (...args: any[]) => {
        reject(...args);
      },
      contentType:
        target === 'search/query'
          ? 'application/x-www-form-urlencoded'
          : options.contentType,
      data:
        target === 'search/query' ? request.get('query').url() : options.data,
      ...options,
    });

    ps.publish(ps.getCurrentPubSubKey(), PubSubEvent.EXECUTE_REQUEST, request);
  });
};

export enum ApiTarget {
  SEARCH = 'search/query',
  EXPORT = 'export/',
  FEEDBACK = 'feedback',
  FEEDBACK_FALLBACK = 'feedback/userfeedback',
}
