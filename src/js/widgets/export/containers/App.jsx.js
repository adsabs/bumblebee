define([
  'underscore',
  'react',
  'react-redux',
  'prop-types',
  'es6!js/widgets/export/actions/index',
  'es6!js/widgets/export/components/Closer.jsx',
  'es6!js/widgets/export/components/Setup.jsx',
  'es6!js/widgets/export/components/Export.jsx',
], function(
  _,
  React,
  ReactRedux,
  ReactPropTypes,
  actions,
  Closer,
  Setup,
  Export
) {
  const {
    closeComponent,
    setFormat,
    getNextBatch,
    fetchUsingQuery,
    fetchUsingIds,
    setCount,
    cancelRequest,
    reset,
    downloadFile,
    getCustomFormats,
  } = actions;

  class App extends React.Component {
    constructor(props) {
      super(props);
      _.bindAll(this, [
        'handleCloseClick',
        'handleApplyClick',
        'handleFormatChange',
        'handleCountChange',
        'handleCancelClick',
        'handleGetNextClick',
        'handleResetClick',
        'handleDownloadFileClick',
        'onCopyText',
        'onCustomFormatClick',
      ]);
      const { dispatch } = props;

      /**
       * The count update is debounced, to make sure that lots of changes don't
       * send many requests.
       */
      this.updateCount = _.debounce((val) => {
        dispatch(setCount(parseInt(val)));
      }, 500);

      this.onCustomFormatChange = _.debounce((val) => {
        dispatch({ type: 'SET_CUSTOM_FORMAT', format: val });
      }, 500);

      this.state = {
        count: '0',
        showAlert: false,
        customFormatDirectEntry: true,
      };
    }

    /**
     * On file download click, dispatch the download file action
     */
    handleDownloadFileClick() {
      this.props.dispatch(downloadFile());
    }

    /**
     * On copy button click, show a message which dissappears after 5 seconds
     */
    onCopyText() {
      this.setState({
        showAlert: true,
        alertMsg: 'Text Copied!',
      });
      _.delay(() => this.setState({ showAlert: false }), 5000);
    }

    /**
     * On close click, close the widget
     */
    handleCloseClick() {
      this.props.dispatch(closeComponent());
    }

    /**
     * On cancel, attempt to cancel request
     *
     * -- this mainly resets the form and ignores the pending request
     */
    handleCancelClick() {
      this.props.dispatch(cancelRequest());
    }

    /**
     * When the count is updated, update the state accordingly
     *
     * @param {number} val - the count
     */
    handleCountChange(val) {
      this.setState({ count: val }, () => this.updateCount(val));
    }

    /**
     * On Apply, the export process is begun
     */
    handleApplyClick() {
      const { dispatch, ids, query } = this.props;

      if (_.isEmpty(query) && !_.isEmpty(ids)) {
        dispatch(fetchUsingIds());
      } else {
        dispatch(fetchUsingQuery()).done(() => dispatch(fetchUsingIds()));
      }
    }

    /**
     * Dispatch a form reset
     */
    handleResetClick() {
      this.props.dispatch(reset());
    }

    onCustomFormatClick() {
      if (
        this.state.customFormatDirectEntry &&
        this.props.customFormats.length > 0
      ) {
        this.onCustomFormatChange(this.props.customFormats[0].code);
      }
      this.setState({
        customFormatDirectEntry: !this.state.customFormatDirectEntry,
      });
    }

    /**
     * Update the format on the state when the user selects a new one
     *
     * @param {string} id - format id
     */
    handleFormatChange(id) {
      const { dispatch, formats, autoSubmit } = this.props;
      const format = _.find(formats, { id: id });

      if (format.value === 'custom' && this.props.customFormats.length > 0) {
        this.onCustomFormatChange(this.props.customFormats[0].code);
      }
      dispatch(setFormat(format));

      // if autoSubmit, then hit apply as the format changes
      autoSubmit && format.value !== 'custom' && this.handleApplyClick();
    }

    /**
     * Get the next set of items
     */
    handleGetNextClick() {
      const { dispatch } = this.props;
      dispatch(getNextBatch());
    }

    componentWillReceiveProps(next) {
      const remaining = next.totalRecs - next.maxCount;
      this.setState({
        count: '' + next.count,
        hasMore: remaining > 0,
        remaining: remaining > next.batchSize ? next.batchSize : remaining,
      });
    }

    render() {
      const {
        format,
        formats,
        isFetching,
        output,
        batchSize,
        showCloser,
        showReset,
        progress,
        maxCount,
        hasError,
        errorMsg,
        totalRecs,
        showSlider,
        splitCols,
        autoSubmit,
        customFormat,
        customFormats,
      } = this.props;
      const {
        count,
        hasMore,
        showAlert,
        alertMsg,
        remaining,
        customFormatDirectEntry,
      } = this.state;

      const low = maxCount - batchSize;
      const lower = low === 0 ? 1 : low;
      const upper = Number(count) + low;

      const shouldShowSlider = totalRecs > 1 && showSlider;

      return (
        <div className="container-fluid export-container">
          <span>
            {showCloser && <Closer onClick={this.handleCloseClick} />}
            <div className="h4">
              Exporting record(s) <strong>{lower}</strong> to{' '}
              <strong>{upper}</strong> <small>(total: {totalRecs})</small>
            </div>
          </span>
          <div>
            <div className={splitCols ? 'col-sm-6' : 'col-sm-12'}>
              <Setup
                format={format}
                formats={formats}
                disabled={isFetching}
                count={count}
                maxCount={maxCount}
                totalRecs={totalRecs}
                batchSize={batchSize}
                hasMore={hasMore}
                showSlider={shouldShowSlider}
                showReset={showReset}
                autoSubmit={autoSubmit}
                remaining={remaining}
                customFormat={customFormat}
                customFormats={customFormats}
                customFormatDirectEntry={customFormatDirectEntry}
                onCustomFormatChange={this.onCustomFormatChange}
                onReset={this.handleResetClick}
                onApply={this.handleApplyClick}
                onCancel={this.handleCancelClick}
                setFormat={this.handleFormatChange}
                onGetNext={this.handleGetNextClick}
                setCount={this.handleCountChange}
                onCustomFormatClick={this.onCustomFormatClick}
              />
              {hasError && (
                <div className="row">
                  <div className="col-sm-10">
                    <div className="alert alert-danger">{errorMsg}</div>
                  </div>
                </div>
              )}

              {showAlert && (
                <div className="row">
                  <div className="col-sm-10">
                    <div className="alert alert-info">{alertMsg}</div>
                  </div>
                </div>
              )}
            </div>
            <div className={splitCols ? 'col-sm-6' : 'col-sm-12'}>
              <Export
                output={output}
                isFetching={isFetching}
                progress={progress}
                onDownloadFile={this.handleDownloadFileClick}
                onCopy={this.onCopyText}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  App.propTypes = {
    dispatch: ReactPropTypes.func.isRequired,
    format: ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string,
    }).isRequired,
    formats: ReactPropTypes.arrayOf(
      ReactPropTypes.shape({
        id: ReactPropTypes.string,
        value: ReactPropTypes.string,
        label: ReactPropTypes.string,
      })
    ).isRequired,
    isFetching: ReactPropTypes.bool.isRequired,
    output: ReactPropTypes.string.isRequired,
    progress: ReactPropTypes.number.isRequired,
    count: ReactPropTypes.number.isRequired,
    maxCount: ReactPropTypes.number.isRequired,
    hasError: ReactPropTypes.bool.isRequired,
    errorMsg: ReactPropTypes.string.isRequired,
    batchSize: ReactPropTypes.number.isRequired,
    totalRecs: ReactPropTypes.number.isRequired,
    showCloser: ReactPropTypes.bool.isRequired,
    showSlider: ReactPropTypes.bool.isRequired,
    splitCols: ReactPropTypes.bool.isRequired,
    showReset: ReactPropTypes.bool.isRequired,
    autoSubmit: ReactPropTypes.bool.isRequired,
  };

  const mapStateToProps = (state) => ({
    format: state.format,
    formats: state.formats,
    output: state.exports.output,
    isFetching: state.exports.isFetching,
    progress: state.exports.progress,
    count: state.exports.count,
    maxCount: state.exports.maxCount,
    hasError: state.error.hasError,
    errorMsg: state.error.errorMsg,
    batchSize: state.exports.batchSize,
    totalRecs: state.exports.totalRecs,
    customFormat: state.exports.customFormat,
    showCloser: state.main.showCloser,
    showSlider: state.main.showSlider,
    autoSubmit: state.main.autoSubmit,
    splitCols: state.main.splitCols,
    showReset: state.main.showReset,
    ids: state.exports.ids,
    query: state.main.query,
    customFormats: state.exports.customFormats,
  });

  return ReactRedux.connect(mapStateToProps)(App);
});
