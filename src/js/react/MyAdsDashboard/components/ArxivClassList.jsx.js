/* eslint-disable max-classes-per-file */
define([
  'underscore',
  'react',
  'react-bootstrap',
  '../models/arxivClasses',
], function(
  _,
  React,
  { Checkbox, ListGroup, ListGroupItem },
  ArxivClassesModel
) {
  const initialState = {
    groups: {
      ...ArxivClassesModel,
    },
    all: false,
  };

  /**
   *
   */
  class ArxivClassList extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        ...initialState,
      };
      this.onSelect = _.debounce(this._onSelect.bind(this), 100);
      this.props.onSelection(this._groupsToArray());
      if (this.props.initialSelected && this.props.initialSelected.length > 0) {
        try {
          this.selectGroups(this.props.initialSelected, true);
        } catch (e) {
          console.error(e);
        }
      }
    }

    _isIndeterminate(children) {
      // only return true if SOME of the children are selected, not all
      const keys = Object.keys(children);
      const selected = keys.filter((k) => children[k].selected);
      return selected.length > 0 && selected.length < keys.length;
    }

    _allSelected(items) {
      return Object.keys(items).every((k) => items[k].selected);
    }

    _noneSelected(items) {
      return !Object.keys(items).some((k) => items[k].selected);
    }

    _groupsToArray() {
      let arr = [];
      Object.keys(this.state.groups).forEach((parentKey) => {
        const item = this.state.groups[parentKey];

        // if it is selected, add it and move on
        if (item.selected) {
          arr = [...arr, item.key];

          // if it is indeterminate, then go into the children and grab them instead
        } else if (item.indeterminate) {
          arr = [
            ...arr,
            ...Object.keys(item.children)
              .filter((k) => item.children[k].selected)
              .map((k) => item.children[k].key),
          ];
        }
      });
      return arr;
    }

    selectGroups(groups, value) {
      if (!groups || groups.length <= 0) {
        return;
      }

      const _groups = this.state.groups;
      const newGroups = groups.reduce(
        (acc, key) => {
          // checking parent keys
          if (acc[key]) {
            acc[key] = {
              ...acc[key],
              selected: value,
              indeterminate: false,
              children: Object.keys(acc[key].children).reduce((a, k) => {
                a[k] = { ...acc[key].children[k], selected: value };
                return a;
              }, {}),
            };
          } else {
            // the key is a child, we need to find the entry
            Object.keys(acc).forEach((k) => {
              if (acc[k].children && acc[k].children[key]) {
                const children = {
                  ...acc[k].children,
                  [key]: {
                    ...acc[k].children[key],
                    selected: value,
                  },
                };
                acc[k] = {
                  ...acc[k],
                  indeterminate: this._isIndeterminate(children),
                  selected: this._allSelected(children),
                  children: children,
                };
              }
            });
          }
          return acc;
        },
        { ..._groups }
      );
      setTimeout(
        () =>
          this.setState({ groups: newGroups }, () =>
            this.props.onSelection(this._groupsToArray())
          ),
        0
      );
    }

    _onSelect(key, value) {
      const valueDefined = typeof value !== 'undefined';
      const _groups = this.state.groups;

      if (_groups[key]) {
        const selected = valueDefined ? value : !_groups[key].selected;
        const newGroups = {
          ..._groups,
          [key]: {
            ..._groups[key],
            selected: selected,
            indeterminate: false,

            // if we are selecting the parent, then select all children too
            children: Object.keys(_groups[key].children).reduce((acc, k) => {
              acc[k] = {
                ..._groups[key].children[k],
                selected: selected,
              };
              return acc;
            }, {}),
          },
        };

        this.setState({ groups: newGroups }, () => {
          this.props.onSelection(this._groupsToArray());
        });
      } else {
        const newGroups = Object.keys(_groups).reduce((acc, k) => {
          if (_groups[k].children && _groups[k].children[key]) {
            const selected = valueDefined
              ? value
              : !_groups[k].children[key].selected;

            const children = {
              ..._groups[k].children,
              [key]: {
                ..._groups[k].children[key],
                selected: selected,
              },
            };

            acc[k] = {
              ..._groups[k],
              indeterminate: this._isIndeterminate(children),
              selected: this._allSelected(children),
              children: children,
            };
          } else {
            acc[k] = { ..._groups[k] };
          }
          return acc;
        }, {});

        this.setState(
          {
            groups: newGroups,
          },
          () => this.props.onSelection(this._groupsToArray())
        );
      }
    }

    onSelectAll() {
      const selectAll = !this.state.all;
      const { groups } = this.state;
      this.setState(
        {
          all: selectAll,
          groups: Object.keys(groups).reduce((acc, k) => {
            acc[k] = {
              ...groups[k],
              selected: selectAll,
              indeterminate: false,
              children: Object.keys(groups[k].children).map((childKey) => ({
                ...groups[k].children[childKey],
                selected: selectAll,
              })),
            };
            return acc;
          }, {}),
        },
        () => {
          this.props.onSelection(this._groupsToArray());
        }
      );
    }

    render() {
      return (
        <div>
          <ListGroup>
            {Object.keys(this.state.groups).map((k) => (
              <Item
                key={this.state.groups[k].key}
                item={this.state.groups[k]}
                onSelect={this.onSelect}
              />
            ))}
          </ListGroup>
        </div>
      );
    }
  }

  class Item extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        expanded: false,
        hasChildren: Object.keys(props.item.children).length > 0,
      };

      this.onSelect = (e, key, value) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.onSelect(key, value);
      };
    }

    expand(e) {
      if (this.state.hasChildren) {
        this.setState({
          expanded: !this.state.expanded,
        });
      } else {
        this.onSelect(e, this.props.item.key);
      }
    }

    render() {
      const { key, label, selected, children, indeterminate } = this.props.item;
      const childrenKeys = Object.keys(children);
      const hasChildren = this.state.hasChildren;

      return (
        <div>
          <ListGroupItem
            onClick={(e) => this.expand(e)}
            style={{
              paddingLeft: hasChildren ? 'auto' : 37,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {hasChildren && (
              <span
                style={{
                  padding: 0,
                  marginRight: 10,
                }}
              >
                <i
                  className={`fa fa-chevron-${
                    this.state.expanded ? 'down' : 'right'
                  }`}
                ></i>
              </span>
            )}
            <Checkbox
              inline
              checked={selected}
              title={label}
              onChange={(e) => this.onSelect(e, key)}
              inputRef={(el) => el && (el.indeterminate = indeterminate)}
            >
              {selected || indeterminate ? (
                <b>{`${key}: ${label}`}</b>
              ) : (
                `${key}: ${label}`
              )}
            </Checkbox>
          </ListGroupItem>

          {this.state.expanded && hasChildren && (
            <ListGroup>
              {childrenKeys.map((childKey) => {
                const { key, label, selected } = children[childKey];
                return (
                  <ListGroupItem
                    key={key}
                    style={{
                      paddingLeft: 70,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onClick={(e) => this.onSelect(e, key)}
                  >
                    <Checkbox
                      inline
                      checked={selected}
                      title={label}
                      onClick={(e) => this.onSelect(e, key)}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {selected ? (
                        <b>{`${key}: ${label}`}</b>
                      ) : (
                        `${key}: ${label}`
                      )}
                    </Checkbox>
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          )}
        </div>
      );
    }
  }

  return ArxivClassList;
});
