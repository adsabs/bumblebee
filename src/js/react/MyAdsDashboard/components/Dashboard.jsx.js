define([
  'underscore',
  'react',
  'es6!./TemplatePill.jsx',
  'moment',
  'es6!./ActionsDropdown.jsx',
  'react-prop-types',
], function(_, React, TemplatePill, moment, ActionsDropdown, PropTypes) {
  const getFriendlyDateString = (dateStr) => {
    return moment(dateStr).format('lll');
  };

  const SortableHeader = ({ children, onClick, direction, active }) => {
    if (!active) {
      return (
        <th scope="col" onClick={() => onClick('asc')}>
          {children}
        </th>
      );
    }
    const caret = direction === 'desc' ? 'down' : 'up';
    return (
      <th
        scope="col"
        onClick={() => onClick(direction === 'desc' ? 'asc' : 'desc')}
      >
        {children} <i className={`fa fa-caret-${caret}`} aria-hidden="true" />
      </th>
    );
  };

  SortableHeader.defaultProps = {
    active: false,
    children: null,
    direction: PropTypes.string,
    onClick: PropTypes.func,
  };

  SortableHeader.propTypes = {
    active: PropTypes.bool,
    children: PropTypes.node,
    direction: PropTypes.string,
    onClick: PropTypes.func,
  };

  /**
   * @typedef {import('../typedefs.js').Notification} Notification
   */

  class MyAdsDashboard extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        activeItem: null,
        searchValue: '',
        filterText: null,
        sortCol: null,
        sortDir: null,
        loadingQuery: false,
      };
      this.onFilter = _.debounce(this.onFilter, 100);
      this.onRunQuery = this.onRunQuery.bind(this);
      this.onToggleActive = this.onToggleActive.bind(this);
      this.onDelete = this.onDelete.bind(this);
      this.onEdit = this.onEdit.bind(this);
    }

    componentDidMount() {
      const { notifications, getNotifications } = this.props;
      if (Object.keys(notifications).length === 0) {
        getNotifications();
      }
    }

    onLeaveItem() {
      requestAnimationFrame(() => this.setState({ activeItem: null }));
    }

    /**
     * @param {string} id
     */
    onEnterItem(id) {
      requestAnimationFrame(() => this.setState({ activeItem: id }));
    }

    /**
     * @param {Notification} item
     */
    onEdit(item) {
      const { editNotification } = this.props;
      editNotification(item.id);
    }

    /**
     * @param {Notification} item
     */
    onDelete(item) {
      const { removeNotification } = this.props;
      // eslint-disable-next-line no-alert
      if (window.confirm('Are you sure?')) {
        removeNotification(item.id);
      }
    }

    onCreateNewNotification() {
      const { createNewNotification } = this.props;
      createNewNotification();
    }

    onImportNotifications() {
      const { importNotifications } = this.props;
      importNotifications();
    }

    /**
     *
     * @param {Notification} item
     */
    onToggleActive(item) {
      const { toggleActive } = this.props;
      toggleActive(item.id);
    }

    onFilter(filterText) {
      requestAnimationFrame(() => this.setState({ filterText }));
    }

    /**
     *
     * @param {string} value
     */
    onSearch(value) {
      this.setState({ searchValue: value });
      this.onFilter(value);
    }

    onSort(sortCol) {
      return (sortDir) => {
        this.setState({ sortCol, sortDir });
      };
    }

    onRunQuery({ id }, queryKey) {
      const { runQuery } = this.props;
      runQuery(id, queryKey);
      this.setState({ loadingQuery: true });
    }

    render() {
      const {
        notifications,
        getNotificationsRequest: getRequest,
        updateNotificationRequest: updateRequest,
        removeNotificationRequest: removeRequest,
      } = this.props;

      const {
        filterText,
        sortCol,
        sortDir,
        searchValue,
        activeItem,
        loadingQuery,
      } = this.state;

      let ids = Object.keys(notifications);
      if (filterText && filterText.length > 0) {
        const regx = new RegExp('.*' + filterText + '.*', 'ig');
        ids = Object.keys(notifications).filter((k) => {
          if (!filterText) {
            return true;
          }

          return _.values(notifications[k])
            .join(' ')
            .match(regx);
        });
      }

      if (sortCol && sortDir) {
        ids = ids.sort((a, b) => {
          const { [a]: left, [b]: right } = notifications;
          const prop = sortCol === '#' ? 'id' : sortCol;
          const dir = sortDir;
          const leftVal = left[prop];
          const rightVal = right[prop];
          if (prop === 'updated') {
            return moment(dir === 'asc' ? leftVal : rightVal).diff(
              dir === 'asc' ? rightVal : leftVal
            );
          }

          if (leftVal < rightVal) {
            return dir === 'asc' ? -1 : 1;
          }
          if (leftVal > rightVal) {
            return dir === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      const disable =
        removeRequest.status === 'pending' ||
        updateRequest.status === 'pending' ||
        getRequest.status === 'pending';

      if (
        (ids.length === 0 && getRequest.status === 'pending') ||
        loadingQuery
      ) {
        return getRequest.status === 'pending' || loadingQuery ? (
          <div className="row text-center">
            <h3 className="h4">
              <i className="fa fa-spinner fa-spin" aria-hidden="true" />{' '}
              Loading...
            </h3>
          </div>
        ) : (
          <div className="row text-center">
            <h3 className="h4 text-danger">Error: {getRequest.error}</h3>
          </div>
        );
      }

      return (
        <div>
          <div className="row" style={{ marginBottom: '2rem' }}>
            <div className="col-sm-4">
              <h3
                className="h3"
                style={{
                  marginBottom: '10px',
                  marginTop: '10px',
                  lineHeight: '20px',
                }}
              >
                Email Notifications
              </h3>
            </div>
            <div className="col-sm-4">
              <input
                type="text"
                name="search"
                id="search"
                className="form-control"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => this.onSearch(e.target.value)}
              />
            </div>
            <div className="col-sm-2 col-sm-offset-2 col-md-3 col-md-offset-1">
              <span className="pull-right hidden-xs">
                <div
                  className="btn-group"
                  role="group"
                  aria-label="group of action buttons"
                >
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => this.onCreateNewNotification()}
                    title="create new notification"
                    disabled={disable}
                  >
                    <i className="fa fa-plus" aria-hidden="true" /> Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => this.onImportNotifications()}
                    title="import notification"
                    disabled={disable}
                  >
                    <i className="fa fa-upload" aria-hidden="true" /> Import
                  </button>
                </div>
              </span>
              <span className="hidden-sm hidden-md hidden-lg hidden-xl">
                <div
                  className="btn-group btn-group-justified"
                  role="group"
                  aria-label="group of action buttons"
                  style={{ marginTop: 10 }}
                >
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => this.onCreateNewNotification()}
                      title="create new notification"
                      disabled={disable}
                    >
                      <i className="fa fa-plus" aria-hidden="true" /> Create
                    </button>
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => this.onImportNotifications()}
                      title="import notification"
                      disabled={disable}
                    >
                      <i className="fa fa-upload" aria-hidden="true" /> Import
                    </button>
                  </div>
                </div>
              </span>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <SortableHeader
                  onClick={this.onSort('#')}
                  active={sortCol === '#'}
                  direction={sortDir}
                >
                  #
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('name')}
                  active={sortCol === 'name'}
                  direction={sortDir}
                >
                  Name
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('template')}
                  active={sortCol === 'template'}
                  direction={sortDir}
                >
                  Type
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('frequency')}
                  active={sortCol === 'frequency'}
                  direction={sortDir}
                >
                  Frequency
                </SortableHeader>

                <SortableHeader
                  onClick={this.onSort('updated')}
                  active={sortCol === 'updated'}
                  direction={sortDir}
                >
                  Updated
                </SortableHeader>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => {
                /** @type {Notification} */
                const item = notifications[id];

                return (
                  <tr
                    className={activeItem === id ? 'info' : ''}
                    style={{
                      backgroundColor: item.active
                        ? 'inherit'
                        : 'rgba(0,0,0,0.09)',
                    }}
                  >
                    <th scope="row" className={item.active ? '' : 'text-faded'}>
                      {i + 1}
                    </th>
                    <td className={item.active ? '' : 'text-faded'}>
                      <h4 className="h5" style={{ margin: 0, marginTop: 3 }}>
                        {item.name}
                      </h4>
                    </td>
                    <td>
                      <TemplatePill
                        name={item.template}
                        disabled={!item.active}
                      />
                    </td>
                    <td className={item.active ? '' : 'text-faded'}>
                      {item.frequency}
                    </td>
                    <td className={item.active ? '' : 'text-faded'}>
                      {getFriendlyDateString(item.updated)}
                    </td>
                    <td>
                      <ActionsDropdown
                        disable={disable}
                        item={item}
                        onDelete={this.onDelete}
                        onEdit={this.onEdit}
                        onRunQuery={this.onRunQuery}
                        onToggleActive={this.onToggleActive}
                        dropup={i > 2}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {ids.length === 0 && searchValue && (
            <div>Your search is not matching any notifications.</div>
          )}
          {ids.length === 0 && !searchValue && (
            <div>You don&apos;t have any notifications yet!</div>
          )}
        </div>
      );
    }
  }

  MyAdsDashboard.defaultProps = {
    createNewNotification: () => {},
    editNotification: () => {},
    getNotifications: () => {},
    getRequest: () => {},
    importNotifications: () => {},
    notifications: [],
    removeNotification: () => {},
    removeRequest: () => {},
    runQuery: () => {},
    toggleActive: () => {},
    updateRequest: () => {},
    getNotificationsRequest: () => {},
    updateNotificationRequest: () => {},
    removeNotificationRequest: () => {},
  };

  MyAdsDashboard.propTypes = {
    createNewNotification: PropTypes.func,
    editNotification: PropTypes.func,
    getNotifications: PropTypes.func,
    getRequest: PropTypes.func,
    importNotifications: PropTypes.func,
    notifications: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        frequency: PropTypes.string,
        updated: PropTypes.string,
        active: PropTypes.bool,
        template: PropTypes.string,
      })
    ),
    removeNotification: PropTypes.func,
    removeRequest: PropTypes.func,
    runQuery: PropTypes.func,
    toggleActive: PropTypes.func,
    updateRequest: PropTypes.func,
    getNotificationsRequest: PropTypes.func,
    updateNotificationRequest: PropTypes.func,
    removeNotificationRequest: PropTypes.func,
  };

  return MyAdsDashboard;
});
