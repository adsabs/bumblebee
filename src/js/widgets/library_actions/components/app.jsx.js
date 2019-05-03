define([
  'underscore',
  'react',
  'es6!./multi-control.jsx',
  'es6!./select.jsx',
  'es6!./radio-group.jsx',
], function (_, React, MultiControl, Select, RadioGroup) {

  const descriptions = {
    'union': 'Take the union of the source and the secondary libraries. This finds all records contained in any of the input libraries. The result is saved to a new library',
    'intersection': 'Take the intersection of the source and the secondary libraries. This finds any records contained in all of the input libraries. The result is saved to a new library',
    'difference': 'Take the difference between the source and the secondary libraries. This finds all records contained in the source library but in none of the secondary libraries. The result is saved to a new library',
    'copy': 'Copy the contents of the source library into the target library. The target library is not emptied first; use the empty operation on the target library first in order to create a duplicate of the source library in the target library',
    'empty': 'Empty the source library of its contents'
  }

  const AppStyles = {
    minHeight: '400px'
  };

  // get the set of actions, this depends on the number of items passed
  const getActions = (items = []) => {
    if (items.length === 1) {
      return ['empty'];
    }
    return ['union', 'intersection', 'difference', 'copy', 'empty'];
  }

  const flattenString = (str) => str.toLowerCase().replace(/\W/g, '_');

  const Loading = () => (
    <div className="all-libraries-widget s-all-libraries-widget library-actions" style={AppStyles}>
      <div className="loading-container">
        <div className="loading">
          <div className="loading-icon-big fa fa-spinner fa-spin"></div>
          <div className="loading-text loading-text-big">Loading...</div>
        </div>
      </div>
    </div>
  );

  const Title = () => (
    <div className="row">
      <div className="col-sm-offset-3 col-sm-6 text-center">
        <i className="fa fa-wrench fa-2x" style={{ marginRight: '5px' }}></i>
        <span className="h3">Library Operations</span>
      </div>
    </div>
  );

  const Descriptions = ({ item = 0, descriptions }) => (
    <div className="form-group">
      <div className="well clearfix" style={{borderRadius: '4px'}}>
        <div className="col-sm-1">
          <i className="fa fa-question-circle fa-2x" aria-hidden="true"></i>
        </div>
        <div className="col-sm-11">
          {descriptions[item]}
        </div>
      </div>
    </div>
  )

  class Alert extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        message: props.message,
        title: props.title
      }
    }
    onClick(e) {
      e.preventDefault();
      this.setState({ message: null, title: null });
      this.props.onClose();
    }
    componentWillReceiveProps({ message, title }) {
      this.setState({ message, title });
    }
    render () {
      const { type } = this.props;
      const { message, title } = this.state;

      if (!message && !title) return null;

      return (
        <div className={`alert alert-${type} alert-dismissable text-center`}>
          <a href="javascript:void(0)" className="close" onClick={e => this.onClick(e)} aria-label="close">&times;</a>
          <p><strong>{title}</strong></p>
          <p dangerouslySetInnerHTML={{ __html: message }}></p>
        </div>
      )
    }
  }
  Alert.defaultProps = {
    title: null,
    message: null
  }

  const Input = ({ label, onInput, hasError, helpBlock='Invalid Input', onKeyDown }) => {
    const id = flattenString(label);

    return (
      <div className={`form-group ${hasError ? 'has-error' : ''}`}>
        <label htmlFor={id} className="control-label">{label}</label>
        <input id={id} type="text" className="form-control" onInput={onInput} onKeyDown={onKeyDown}></input>
        {hasError &&
          <span className="help-block">{helpBlock}</span>
        }
      </div>
    );
  };

  class App extends React.Component {
    constructor (props) {
      super(props);
      this.initialState = {
        actions: [],
        action: null,
        source: null,
        secondary: [],
        target: null,
        status: null,
        targetInvalid: false
      };
      this.state = { ...this.initialState };
      this.onTargetInput = this.onTargetInput.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidMount() {
      this.props.onRef(this);
    }

    componentWillUnmount() {
      this.props.onRef(undefined);
    }

    updateStatus(status) {
      this.setState({ status });
    }

    componentWillReceiveProps({ items }) {
      const actions = getActions(items);
      if (items.length === 0) {
        return this.setState({
          ...this.initialState,
          actions,
          action: actions[0]
        });
      }
      this.setState(({ action, status, source, secondary }) => ({
        actions,
        action: action || actions[0],
        source: source || items.length > 0 && items[0].id,
        secondary: secondary.length > 0 ? secondary : [items.length > 0 && items[0].id],
        status: status
      }));
    }

    onTargetInput (e) {
      const { items } = this.props;
      const target = e.target.value;
      if (_.find(items, { name: target })) {
        return this.setState({ targetInvalid: true });
      }
      this.setState({ target, targetInvalid: false });
    }

    onKeyDown (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.onSubmit(e);
      }
    }

    onSubmit (e) {
      e.preventDefault();
      const source = _.find(this.props.items, { id: this.state.source });
      const secondary = _.find(this.props.items, { id: this.state.secondary[0] });
      if (this.state.action === 'empty'
        && !confirm(`Are you sure you want to empty "${source.name}"?`)) {
        return;
      }
      if (this.state.action === 'copy'
        && !confirm(`Are you sure? This operation will append records from "${source.name}" to "${secondary.name}"`)) {
        return;
      }
      // this.setState({ status: null });
      this.props.onSubmit(_.pick(this.state, [
        'action', 'source', 'secondary', 'target'
      ]));
    }

    render() {
      const { items, loading, submitting } = this.props;
      const { action, actions, source, status, targetInvalid } = this.state;
      if (loading) return <Loading/>

      return (
        <div className="all-libraries-widget s-all-libraries-widget" style={AppStyles}>
          <Title/>
          <form onSubmit={e => this.onSubmit(e)}>
            <RadioGroup
              label="Select an Action"
              options={actions}
              direction="inline"
              onChange={action => this.setState({ action })}
            />

            <Descriptions descriptions={descriptions} item={action} />

            <Select
              label="Source Library"
              items={items}
              value={source}
              onChange={source => this.setState({ source })}
            />

            { action !== 'empty' && action !== 'copy' &&
              <MultiControl
                items={items}
                addLabel="Add Library"
                max={items.length - 1}
                onChange={secondary => this.setState({ secondary })}
              >
                { (idx, onChange) =>
                  <Select
                    label="Secondary Library"
                    index={idx}
                    key={idx}
                    items={items}
                    onChange={onChange}
                  />
                }
              </MultiControl>
            }

            { action === 'copy' &&
              <Select
                label="Target Library"
                items={items}
                onChange={val => this.setState({ secondary: [val] })}
              />
            }

            { action !== 'empty' && action !== 'copy' &&
              <Input label="New Library Name"
                onInput={this.onTargetInput}
                onKeyDown={this.onKeyDown}
                hasError={targetInvalid}
                helpBlock="New library name must be unique.  Change name, or leave blank and one will be generated."
              />
            }

            <div className="form-group">
              {submitting ?
                <button className="btn btn-primary" disabled>
                  <i className="fa fa-spinner fa-spin" aria-hidden="true"></i> Submitting...
                </button>
                :
                <button className="btn btn-primary" type="submit" disabled={targetInvalid}>Submit</button>
              }
            </div>

            { items.length === 1 && action === 'empty' &&
              <Alert
                type="info"
                message="Restricted to 'Empty' action because we only found a single library to operate on."
              />
            }

            { status && status.result === 'success' &&
              <Alert type="info" title="Operation Completed Successfully" message={status.message} onClose={() => this.setState({ status: null })} />
            }

            { status && status.result === 'error' &&
              <Alert type="danger" title="Operation Failed" message={status.message} onClose={() => this.setState({ status: null })} />
            }
          </form>
        </div>
      );
    }
  }

  App.defaultProps = {
    items: [],
    onSubmit: () => {}
  }

  return App;
});
