

define([
  'react',
  'react-prop-types'
], function (React, ReactPropTypes) {
  const Setup = ({
    onApply, setFormat, disabled, onCancel, batchSize, hasMore, onReset,
    format, formats, count, setCount, maxCount, onGetNext, totalRecs,
    showSlider, showReset, remaining, autoSubmit, customFormat, onCustomFormatChange,
    customFormats, customFormatSelected, onCustomFormatSelectionChange, customFormatDirectEntry,
    onCustomFormatClick
  }) => (
    <div>
      <div className="row">
        <div className="col-sm-10">
          <label htmlFor="ex-dropdown">Select Export Format</label>
          <select
            className="form-control"
            autoFocus="true"
            id="ex-dropdown"
            value={format.id}
            onChange={e => setFormat(e.target.value)}
            disabled={disabled}
          >
            {formats.map(f => <option key={f.id} value={f.id} title={f.help}>{f.label}</option>)}
          </select>
        </div>
        { disabled
        && <div className="col-sm-2">
          <div className="export-loading-icon fa fa-spinner fa-spin fa-2x"/>
        </div>
        }
      </div>

      { format.value === 'custom'
        && <div className="row">
          <div className="col-sm-10">
           {!customFormatDirectEntry &&
            <div className="col-sm-12">
              <label htmlFor="ex-custom-input">
                Select a Custom Format
                <span style={{ marginLeft: 5 }}>
                  <a
                    title="Get Help With ADS Custom Format Syntax"
                    target="_blank"
                    rel="noopener"
                    href="https://adsabs.github.io/help/actions/export">
                    <i className="fa fa-info-circle fa-invert" />
                  </a>
                </span>
                <span style={{ marginLeft: 5 }}>
                  <a
                    title="manage custom formats"
                    href="/#user/settings/application">
                    <i className="fa fa-cog fa-invert"></i>
                  </a>
                </span>
              </label>
              <select
                className="form-control"
                value={customFormat}
                onChange={e => onCustomFormatChange(e.target.value)}
              >
              {customFormats.map((f) => (
                <option value={f.code} key={f.id}>{f.name}</option>
              ))}
              </select>
              <button className="btn btn-link" role="button" onClick={onCustomFormatClick}>Or enter your own</button>
            </div>
            }
            { customFormatDirectEntry &&
              <div className="col-sm-12">
                <label htmlFor="ex-custom-input">
                  Enter Custom Format
                  <span style={{ marginLeft: 5 }}>
                    <a
                      title="Get Help With ADS Custom Format Syntax"
                      target="_blank"
                      rel="noopener"
                      href="https://adsabs.github.io/help/actions/export">
                      <i className="fa fa-info-circle fa-invert" />
                    </a>
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={customFormat}
                  onChange={e => onCustomFormatChange(e.target.value)}
                />
                {customFormats.length > 0 &&
                  <button className="btn btn-link" role="button" onClick={onCustomFormatClick}>Or select from your saved custom formats</button>
                }
              </div>
            }
          </div>
        </div>
      }

      { showSlider
        && <div className="row">
          <div className="col-sm-10">
            <label htmlFor="ex-range">
              Limit to <strong>{count}</strong> {count > 1 ? 'records' : 'record'}
            </label>
            <input
              type="range"
              id="ex-range"
              min="1"
              max={totalRecs < batchSize ? totalRecs : batchSize}
              step="1"
              value={count}
              disabled={disabled}
              onChange={e => setCount(e.target.value)}
            />
          </div>
        </div>
      }

      <div className="row">
        <div className="col-sm-12 btn-toolbar">
          {(!autoSubmit || format.value === 'custom')
          && <button
            className="btn btn-primary"
            onClick={onApply}
            disabled={disabled}
          >
            Apply
          </button>
          }
          {!disabled && showReset
          && <button
            className="btn btn-info"
            onClick={onReset}
          >
            Reset
          </button>
          }
          {!disabled && hasMore
            && <button
              className="btn btn-link"
              onClick={onGetNext}
            >
              Get Next {remaining} Record(s)
            </button>
          }
          {disabled && (!autoSubmit || format.value === 'custom')
            && <button
              className="btn btn-warning"
              onClick={onCancel}
            >
              Cancel
            </button>
          }
        </div>
      </div>
    </div>
  );

  Setup.propTypes = {
    setFormat: ReactPropTypes.func.isRequired,
    format: ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    }).isRequired,
    onApply: ReactPropTypes.func.isRequired,
    onCancel: ReactPropTypes.func.isRequired,
    formats: ReactPropTypes.arrayOf(ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    })).isRequired,
    disabled: ReactPropTypes.bool.isRequired,
    count: ReactPropTypes.string.isRequired,
    setCount: ReactPropTypes.func.isRequired,
    maxCount: ReactPropTypes.number.isRequired,
    onGetNext: ReactPropTypes.func.isRequired,
    totalRecs: ReactPropTypes.number.isRequired,
    onReset: ReactPropTypes.func.isRequired,
    showSlider: ReactPropTypes.bool.isRequired,
    showReset: ReactPropTypes.bool.isRequired,
    autoSubmit: ReactPropTypes.bool.isRequired
  };

  return Setup;
});
