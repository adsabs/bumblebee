import React from 'react';

type BumblebeeApp = any;
declare var bbb: BumblebeeApp;

type ArticleRecord = {
  id: string;
  bibcode: string;
};

export type JSONResponse = {
  export: string;
  response: {
    docs: ArticleRecord[];
    numFound: number;
  };
};

const useBumblebee = () => {
  const bumblebeeGlobal = React.useRef<BumblebeeApp>(bbb);

  return {
    app: bumblebeeGlobal.current,
    getAppConfig: React.useCallback(() => {
      return bumblebeeGlobal.current.__beehive.getObject('DynamicConfig');
    }, []),
    publish: React.useCallback((event: PubSubEvent, ...args: any) => {
      const ps = bumblebeeGlobal.current.__beehive.getService('PubSub');
      return ps.publish(ps.getCurrentPubSubKey(), event, ...args);
    }, []),
    subscribe: React.useCallback(
      (event: PubSubEvent, callback: (event: string) => void) => {
        const ps = bumblebeeGlobal.current.__beehive.getService('PubSub');
        return ps.subscribe(ps.getCurrentPubSubKey(), event, callback);
      },
      []
    ),
    unsubscribe: React.useCallback((event: PubSubEvent) => {
      const ps = bumblebeeGlobal.current.__beehive.getService('PubSub');
      return ps.unsubscribe(ps.getCurrentPubSubKey(), event);
    }, []),
    sendApiRequest: React.useCallback(
      ({
        options,
        target,
        query,
      }: {
        options?: any;
        target: string;
        query: any;
      }) => {
        return new Promise<JSONResponse>((resolve, reject) => {
          const ps = bumblebeeGlobal.current.__beehive.getService('PubSub');
          const {
            makeApiQuery,
            makeApiRequest,
          } = bumblebeeGlobal.current.getObject('Utils');
          const request = makeApiRequest({
            target,
            query: makeApiQuery(query),
          });

          request.set('options', {
            done: (response: JSONResponse) => {
              resolve(response);
            },
            fail: (e: Error) => {
              reject(e);
            },
            contentType:
              target === 'search/query'
                ? 'application/x-www-form-urlencoded'
                : options.contentType,
            data:
              target === 'search/query'
                ? request.get('query').url()
                : options.data,
            ...options,
          });

          ps.publish(
            ps.getCurrentPubSubKey(),
            PubSubEvent.EXECUTE_REQUEST,
            request
          );
        });
      },
      []
    ),
  };
};

export enum PubSubEvent {
  START_SEARCH = '[PubSub]-New-Query',
  INVITING_REQUEST = '[PubSub]-Inviting-Request',
  DELIVERING_REQUEST = '[PubSub]-New-Request',
  EXECUTE_REQUEST = '[PubSub]-Execute-Request',
  EXECUTE_STORED_QUERY = '[PubSub]-Execute-Stored-Query',
  DELIVERING_RESPONSE = '[PubSub]-New-Response',
  CLOSING_GATES = '[PubSub]-Closing',
  CLOSED_FOR_BUSINESS = '[PubSub]-Closed',
  OPENING_GATES = '[PubSub]-Opening',
  OPEN_FOR_BUSINESS = '[PubSub]-Ready',
  SMALL_FIRE = '[PubSub]-Problem',
  BIG_FIRE = '[PubSub]-Big-Problem',
  CITY_BURNING = '[PubSub]-Disaster',
  FEEDBACK = '[FC]-FeedBack',
  DISPLAY_DOCUMENTS = '[Router]-Display-Documents',
  DISPLAY_DOCUMENTS_DETAILS = '[Router]-Display-Documents-Details',
  GET_QTREE = '[FC]-GetQTree',
  NAVIGATE = '[Router]-Navigate-With-Trigger',
  PAGE_CHANGE = '[Navigator]Page-Changed',
  CUSTOM_EVENT = '[PubSub]-Custom-Event',
  ARIA_ANNOUNCEMENT = '[PubSub]-Aria-Announcement',
  USER_ANNOUNCEMENT = '[PubSub]-User-Announcement',
  ALERT = '[Alert]-Message',
  ORCID_ANNOUNCEMENT = '[PubSub]-Orcid-Announcement',
  APP_LOADED = '[App]-Application-Loaded',
  APP_BOOTSTRAPPED = '[App]-Application-Bootstrapped',
  APP_STARTING = '[App]-Application-Starting',
  APP_STARTED = '[App]-Application-Started',
  APP_EXIT = '[App]-Exit',
  PAPER_SELECTION = '[User]-Paper-Selection',
  BULK_PAPER_SELECTION = '[User]-Bulk-Paper-Selection',
  STORAGE_PAPER_UPDATE = '[User]-Paper-Update',
  LIBRARY_CHANGE = '[PubSub]-Library-Change',
}

export default useBumblebee;
