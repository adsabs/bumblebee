define(['underscore', 'react', 'react-dom', 'react-redux'], function(
  _,
  React,
  ReactDOM,
  { Provider }
) {
  const WithBackboneView = (component, getStore) => {
    const view = Backbone.View.extend({
      initialize() {
        this.setElement = _.once(this.setElement);
        this.props = {
          trigger: (...args) => this.trigger(...args),
        };
        if (typeof getStore === 'function') {
          this._store = getStore(this.props);
        }
      },

      render(el) {
        if (!this.el && el) {
          this.setElement(el);
        } else {
          this.setElement(document.createElement('div'));
        }

        if (this._store) {
          ReactDOM.render(
            React.createElement(
              Provider,
              {
                store: this._store,
              },
              React.createElement(component, this.props)
            ),
            this.el
          );
        } else {
          ReactDOM.render(React.createElement(component, this.props), this.el);
        }
        return this;
      },

      destroy() {
        ReactDOM.unmountComponentAtNode(this.el);
        return this;
      },
    });

    return view;
  };

  return WithBackboneView;
});
