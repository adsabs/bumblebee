define([
  'marionette',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/dropdown-menu/templates/dropdown',
  'hbs!js/widgets/dropdown-menu/templates/dropdown-item'
],
function (Marionette, BaseWidget, dropdownTemplate, dropdownItemTemplate) {
  /*
     *
     * To use this widget to generate a dropdown list,
     * you should pass a configuration object to the
     * widget called links, in the form
     *  links : [{href : '' , description : '' , navEvent: ''}]
     *
     * */

  var DropdownModel = Backbone.Model.extend({

    defaults: function () {
      return {
        selected: false,
        href: undefined,
        description: undefined,
        navEvent: undefined,
        pubsubEvent: undefined,
        section: undefined,
        hideIfNoItemsSelected: false
      };
    }
  });

  var DropdownCollection = Backbone.Collection.extend({

    initialize: function (models, options) {
      this.on('change:selected', this.removeOtherSelected);
    },

    model: DropdownModel,

    // only allow 1 selected model at a time
    removeOtherSelected: function (selectedModel, val) {
      if (val === false) {
        return;
      }
      this.each(function (m) {
        if (m !== selectedModel) {
          m.set('selected', false);
        }
      });
    }
  });

  var DropdownItemView = Marionette.ItemView.extend({

    events: {
      click: 'setSelected'
    },

    setSelected: function (e) {
      this.model.set('selected', true);
      return false;
    },
    template: dropdownItemTemplate,
    onRender: function () {

      // force the element to unwrap, so we can control the root element
      this.setElement(this.el.innerHTML);
    }
  });

  var ContainerModel = Backbone.Model.extend({
    defaults: function () {
      return {
        // should we show the option to export only selected?
        selectedOption: false,
        // are there currently selected papers?
        selectedPapers: false,
        // should we only export selected? this is changed by the radio
        // by default it is true if the above two vals are true
        onlySelected: true
      };
    }
  });

  var DropdownView = Marionette.CompositeView.extend({

    initialize: function (options) {
      options = options || {};
    },

    modelEvents: {
      'change:selectedOption': 'render',
      'change:selectedPapers': 'render'
    },

    collectionEvents: {
      'change:selected': function () {
        this.$el.removeClass('open');
      }
    },

    className: 'btn-group dropdown-widget s-dropdown-widget',

    childView: DropdownItemView,
    childViewContainer: '.link-container',
    template: dropdownTemplate,

    serializeData: function () {
      var data = this.model.toJSON();
      // what color should the button be?
      data.btnType = Marionette.getOption(this, 'btnType') || 'btn-default';
      data.dropdownTitle = Marionette.getOption(this, 'dropdownTitle');
      data.iconClass = Marionette.getOption(this, 'iconClass');
      // whether to right align the dropdown
      data.pullRight = Marionette.getOption(this, 'rightAlign');
      return data;
    },

    events: {
      'change input.papers': function (e) {
        var $t = $(e.target);
        $t.attr('value') == 'all' ? this.model.set('onlySelected', false) : this.model.set('onlySelected', true);
      },

      'click .dropdown-menu label': function (e) {
        e.stopPropagation && e.stopPropagation();
      }
    }
  });

  var DropdownWidget = BaseWidget.extend({

    initialize: function (options) {
      this.options = _.defaults(options, {
        updateLinks: _.noop
      });
      if (!this.options.links) {
        throw new Error('Dropdown menu will be empty!');
      }
      // selectedOption: do we want the option to switch from showing all papers vs showing selected papers?
      this.model = new ContainerModel({ selectedOption: this.options.selectedOption });
      this.collection = new DropdownCollection(this.options.links);
      this.view = new DropdownView(_.extend({ collection: this.collection, model: this.model }, this.options));
      this.listenTo(this.collection, 'change:selected', (model, value) => {
        if (model.has('navEvent')) {
          this.emitNavigateEvent(model, value);
        } else if (model.has('pubsubEvent')) {

          const onlySelected = this.getOnlySelected();

          // if the item has pubsubEvent, call the event
          this.getPubSub().publish(this.getPubSub().CUSTOM_EVENT, model.get('pubsubEvent'), { onlySelected });
        }
        model.set('selected', false);
      });
    },

    activate: function (beehive) {
      _.bindAll(this);
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.STORAGE_PAPER_UPDATE, this.onStoragePaperChange);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.updateFromUserData);
      this.updateFromUserData();
    },

    getUserData: function () {
      try {
        var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
        var user = _.isFunction(beehive.getObject) && beehive.getObject('User');
        if (_.isPlainObject(user)) {
          return _.isFunction(user.getUserData) && user.getUserData('USER_DATA');
        }
        return {};
      } catch (e) {
        return {};
      }
    },

    updateFromUserData: function () {
      var userData = this.getUserData();
      var links = this.options.updateLinks(userData, this.options.links) || this.options.links;
      this.options.links = links;
      this.collection.reset(this.options.links);
    },

    onStoragePaperChange: function (numSelected) {
      this.model.set('selectedPapers', !!numSelected);
    },

    getOnlySelected: function () {
      return (this.model.get('selectedOption') && this.model.get('selectedPapers') && this.model.get('onlySelected'));
    },

    emitNavigateEvent: function (model, value) {
      var onlySelected = this.getOnlySelected();
      if (value) {
        var args = _.extend({ onlySelected: onlySelected }, model.get('params'));
        this.getPubSub().publish(this.getPubSub().NAVIGATE, model.get('navEvent'), args);
      }
      model.set('selected', false);
    }

  });

  return DropdownWidget;
});
