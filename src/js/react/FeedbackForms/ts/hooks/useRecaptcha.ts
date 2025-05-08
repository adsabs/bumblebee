import React, {useCallback} from 'react';
import {useBumblebee} from './index';

declare global {
  export interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    }
  }
}
export const useRecaptcha = (formName: string) => {
  const {getAppConfig} = useBumblebee();
  const siteKey = React.useMemo(() => getAppConfig().recaptchaKey, [
    getAppConfig,
  ]);

  const execute = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, {action: `feedback/${formName}`}).then((token) => {
            resolve(token);
          }).catch((err) => {
            reject(err);
          })
        });
      } else {
        reject('Recaptcha not loaded');
      }
    });
  }, [window.grecaptcha, siteKey, formName]);

  return {
    execute,
  };
}
