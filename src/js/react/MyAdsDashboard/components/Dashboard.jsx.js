define([
  'underscore',
  'react',
  'es6!./TemplatePill.jsx',
  'moment',
  'react-bootstrap',
], function(
  _,
  React,
  TemplatePill,
  moment,
  { Dropdown, MenuItem, ButtonGroup, Button }
) {
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
    } else {
      const caret = direction === 'desc' ? 'down' : 'up';
      return (
        <th
          scope="col"
          onClick={() => onClick(direction === 'desc' ? 'asc' : 'desc')}
        >
          {children}{' '}
          <i className={`fa fa-caret-${caret}`} aria-hidden="true"></i>
        </th>
      );
    }
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
      };
      this.onFilter = _.debounce(this.onFilter, 100);
    }

    /**
     * @param {Notification} item
     */
    onEdit(item) {
      this.props.editNotification(item.id);
    }

    /**
     * @param {Notification} item
     */
    onDelete(item) {
      if (confirm('Are you sure?')) {
        this.props.removeNotification(item.id);
      }
    }

    onCreateNewNotification() {
      this.props.createNewNotification();
    }

    onImportNotifications() {
      this.props.importNotifications();
    }

    /**
     *
     * @param {Notification} item
     */
    onToggleActive(item) {
      this.props.toggleActive(item.id);
    }

    /**
     * @param {string} id
     */
    onEnterItem(id) {
      requestAnimationFrame(() => this.setState({ activeItem: id }));
    }

    onLeaveItem() {
      requestAnimationFrame(() => this.setState({ activeItem: null }));
    }

    componentDidMount() {
      if (Object.keys(this.props.notifications).length === 0) {
        this.props.getNotifications();
      }
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

    onRunQuery({ id }) {
      this.props.runQuery(true);
      this.props.editNotification(id);
    }

    render() {
      let ids = Object.keys(this.props.notifications);
      if (this.state.filterText && this.state.filterText.length > 0) {
        const regx = new RegExp('.*' + this.state.filterText + '.*', 'ig');
        ids = Object.keys(this.props.notifications).filter((k) => {
          if (!this.state.filterText) {
            return true;
          }

          return _.values(this.props.notifications[k])
            .join(' ')
            .match(regx);
        });
      }

      if (this.state.sortCol && this.state.sortDir) {
        ids = ids.sort((a, b) => {
          const { [a]: left, [b]: right } = this.props.notifications;
          const prop = this.state.sortCol === '#' ? 'id' : this.state.sortCol;
          const dir = this.state.sortDir;
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
      const getRequest = this.props.getNotificationsRequest;
      const updateRequest = this.props.updateNotificationRequest;
      const removeRequest = this.props.removeNotificationRequest;
      const disable =
        removeRequest.status === 'pending' ||
        updateRequest.status === 'pending' ||
        getRequest.status === 'pending';

      if (ids.length === 0 && getRequest.status === 'pending') {
        return (
          <div className="row text-center">
            <h3 className="h4">
              <i className="fa fa-spinner fa-spin" aria-hidden="true" />{' '}
              Loading...
            </h3>
          </div>
        );
      } else if (ids.length === 0 && getRequest.status === 'failure') {
        return (
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
                value={this.state.searchValue}
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
                    className="btn btn-default"
                    onClick={() => this.onCreateNewNotification()}
                    title="create new notification"
                    disabled={disable}
                  >
                    <i className="fa fa-plus" aria-hidden="true" /> Create
                  </button>
                  <button
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
                  active={'#' === this.state.sortCol}
                  direction={this.state.sortDir}
                >
                  #
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('name')}
                  active={'name' === this.state.sortCol}
                  direction={this.state.sortDir}
                >
                  Name
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('template')}
                  active={'template' === this.state.sortCol}
                  direction={this.state.sortDir}
                >
                  Type
                </SortableHeader>
                <SortableHeader
                  onClick={this.onSort('frequency')}
                  active={'frequency' === this.state.sortCol}
                  direction={this.state.sortDir}
                >
                  Frequency
                </SortableHeader>

                <SortableHeader
                  onClick={this.onSort('updated')}
                  active={'updated' === this.state.sortCol}
                  direction={this.state.sortDir}
                >
                  Updated
                </SortableHeader>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => {
                /** @type {Notification} */
                const item = this.props.notifications[id];
                const isGeneral = item.type === 'query';

                return (
                  <tr
                    className={this.state.activeItem === id ? 'info' : ''}
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
                      {item.name}
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
                      <Dropdown
                        disabled={disable}
                        dropup={true}
                        id={`actions-dropdown-${item.id}`}
                      >
                        <Dropdown.Toggle>
                          <i className="fa fa-cog" aria-hidden="true"></i>{' '}
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          style={{ overflow: 'visible !important' }}
                        >
                          <MenuItem
                            href="javascript:void(0);"
                            onClick={() => this.onToggleActive(item)}
                          >
                            {item.active ? (
                              <i
                                className="fa fa-check-circle-o fa-fw"
                                aria-hidden="true"
                              ></i>
                            ) : (
                              <i
                                className="fa fa-circle-o fa-fw"
                                aria-hidden="true"
                              ></i>
                            )}{' '}
                            {item.active ? 'Disable' : 'Enable'}
                          </MenuItem>
                          {isGeneral && (
                            <MenuItem
                              href="javascript:void(0);"
                              onClick={() => this.onRunQuery(item)}
                            >
                              <i
                                className="fa fa-bolt fa-fw"
                                aria-hidden="true"
                              ></i>{' '}
                              Run Query
                            </MenuItem>
                          )}
                          <MenuItem
                            href="javascript:void(0);"
                            onClick={() => this.onEdit(item)}
                          >
                            <i
                              className="fa fa-pencil fa-fw"
                              aria-hidden="true"
                            ></i>{' '}
                            Edit
                          </MenuItem>
                          <MenuItem
                            href="javascript:void(0);"
                            onClick={() => this.onDelete(item)}
                          >
                            <i
                              className="fa fa-trash fa-fw"
                              aria-hidden="true"
                            ></i>{' '}
                            Delete
                          </MenuItem>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {ids.length === 0 && this.state.searchValue && (
            <div>Your search is not matching any notifications.</div>
          )}
          {ids.length === 0 && !this.state.searchValue && (
            <div>You don't have any notifications yet!</div>
          )}
        </div>
      );
    }
  }

  return MyAdsDashboard;
});
