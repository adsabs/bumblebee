import React from 'react';
import { useAsync } from 'react-async';
import FlexView from 'react-flexview';
import { useFormContext } from 'react-hook-form';
import { Control } from '../components';
import { SubmitCorrectAbstractFormValues } from '../models';
import { fetchFullRecord, FullRecord } from './api';
import { defaultValues, IOriginContext, OriginCtx } from './SubmitCorrectAbstract';

interface IBibcodeLoadedBtnProps {
  onLoaded: () => void;
  onLoading: () => void;
}

const BibcodeLoaderBtn: React.FC<IBibcodeLoadedBtnProps> = ({
  onLoaded,
  onLoading,
}) => {
  const { setOrigin } = React.useContext<IOriginContext>(OriginCtx);
  const { register, errors, getValues, reset } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();
  const { run, isLoading, isFulfilled, data, error, setError } = useAsync<
    FullRecord
  >({
    deferFn: fetchFullRecord,
  });

  // load record callback
  const loadRecord = React.useCallback(() => {
    (async () => {
      const { bibcode } = getValues();

      // drop out early if the bibcode is empty
      if (!bibcode) {
        return;
      }

      if (bibcode.length === 19 && !isLoading) {
        run(bibcode);
      } else {
        setError({ name: 'bibcode', message: 'Invalid Bibcode' });
      }
    })();
  }, []);

  // run once on initial load
  React.useEffect(loadRecord, []);

  // this will update the form and context based on data returned
  React.useEffect(() => {
    const { name, email, entryType } = getValues();
    if (isFulfilled && data) {
      const fullRecord: SubmitCorrectAbstractFormValues = {
        ...defaultValues,
        name,
        email,
        entryType,
        ...data,
      };

      reset(fullRecord);
      setOrigin(fullRecord);
      onLoaded();
    } else if (isLoading) {
      onLoading();
    }
  }, [isFulfilled, isLoading]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <Control
        type="text"
        field="bibcode"
        label="Bibliographic Code"
        a11yPrefix="feedback"
        placeholder="1999ApJ...511L..65Y"
        ref={register}
        errorMessage={
          errors.bibcode
            ? errors.bibcode.message
            : error
              ? error.message
              : undefined
        }
        inputProps={{
          onKeyUp: (e) => e.which === 13 && loadRecord(),
        }}
      />
      <FlexView>
        <button
          type="button"
          onClick={loadRecord}
          className="btn btn-default"
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fa fa-spin fa-spinner" aria-hidden/>
          ) : (
            <>
              <i className="fa fa-folder-open-o" aria-hidden/> Load Record
            </>
          )}
        </button>
      </FlexView>
    </div>
  );
};

BibcodeLoaderBtn.defaultProps = {
  onLoaded: () => null,
  onLoading: () => null,
};

export default BibcodeLoaderBtn;
