define([
  'js/page_managers/toc_controller',
  'js/page_managers/one_column_view',
  'hbs!js/wraps/landing_page_manager/landing-page-layout',
  'hbs!js/wraps/landing_page_manager/landing-page-nav',
], function(
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  TOCTemplate
) {
  var PageManager = PageManagerController.extend({
    /**
     * Attempt to get the current default home page from user data
     */
    getHomePageFromUserData: function() {
      try {
        const userData = this.getBeeHive()
          .getObject('User')
          .getUserData();
        return userData.homePage;
      } catch (e) {
        return null;
      }
    },

    /**
     * Overrides activate to add subscription to user announcements about changes
     * to the default home page.
     */
    activate: function() {
      PageManagerController.prototype.activate.apply(this, arguments);

      const ps = this.getPubSub();
      ps.subscribe(ps.USER_ANNOUNCEMENT, (ev, data) => {
        if (ev === 'user_info_change' && data && data.homePage) {
          this.setHomePage(data.homePage);
        }
      });

      const defaultHomePage = this.getHomePageFromUserData();
      if (defaultHomePage) {
        this.setHomePage(defaultHomePage);
      }
    },

    /**
     * Parse and find the navigation item from the navConfig object
     * and set the property
     * @param {string} page the name of the page
     */
    setHomePage: function(page) {
      if (page) {
        const name = page.split(' ')[0];

        // find the page in the navConfig
        const navItem = Object.keys(this.navConfig).filter(
          (key) => this.navConfig[key].title === name
        );
        if (navItem.length > 0) {
          this.__defaultNavItem = navItem[0];
        }
      }
    },

    onWidgetSelected(child, ev, attrs) {
      PageManagerController.prototype.onWidgetSelected.apply(this, arguments);
    },

    /**
     * Override the setActive method to inject the default navItem, if we have one
     * @param {string} navItem the navitem name
     * @param {string} subView the subview item
     * @param {object} extra additional flags/options
     */
    setActive: function(navItem, subView, extra) {
      if (extra && extra.origin === 'index-page' && this.__defaultNavItem) {
        if (
          this.widgets.tocWidget.model.get('idAttribute') ===
          this.__defaultNavItem
        ) {
          PageManagerController.prototype.setActive.call(
            this,
            'SearchWidget',
            subView
          );
        }
        PageManagerController.prototype.setActive.call(
          this,
          this.__defaultNavItem,
          subView
        );
      } else {
        PageManagerController.prototype.setActive.apply(this, arguments);
      }
    },

    TOCTemplate: TOCTemplate,

    className: 's-landing-page-layout',
    id: 'landing-page-layout',

    pageConfig: {
      template: PageManagerTemplate,
      view: PageManagerView,
    },

    navConfig: {
      ClassicSearchForm: {
        title: 'Classic',
        order: 1,
        path: '/classic-form',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="290px" height="246px" viewBox="0 0 290 246" version="1.1"><title>Artboard 1</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="5" fill="none" fill-rule="evenodd"><g class="svg-needs-stroke" stroke-width="5" fill="#FFFFFF" fill-opacity="0"><g transform="translate(80.000000, 53.000000)"><rect x="0" y="0" width="129.999945" height="139.429993"/><rect x="13.4714969" y="24.9222692" width="42.4352152" height="24.9222692"/><rect x="74.0932328" y="24.9222692" width="42.4352152" height="24.9222692"/><rect x="13.4714969" y="61.2953108" width="103.056951" height="16.1657963"/><rect x="13.4714969" y="89.5854542" width="103.056951" height="33.0051673"/></g></g></g></svg>',
      },
      SearchWidget: {
        title: 'Modern',
        order: 2,
        path: '/',
        isSelected: 'true',
        svg:
          '<svg class="modern-search" xmlns="http://www.w3.org/2000/svg" width="172px" height="28px" viewBox="0 0 172 28" version="1.1"><title>Rectangle 8 + Rectangle 8</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-40.000000, -82.000000)" class="svg-needs-fill"><g transform="translate(40.000000, 82.000000)"><path d="M4.26325641e-14 0L4.26325641e-14 27.0939606 164.990643 27.0939606C168.867791 27.0939606 172 23.9622017 172 20.0989813L172 6.9949793C172 3.13448997 168.861804 0 164.990643 0L4.26325641e-14 0ZM164.990643 3C167.205202 3 169 4.7916 169 6.9949793L169 20.0989813C169 22.3064289 167.209851 24.0939606 164.990643 24.0939606L3 24 3 3 164.990643 3Z"/><g transform="translate(147.000000, 6.000000)"><path d="M10.6047437 11.077395C9.59359708 11.8615052 8.32401807 12.3282675 6.9454209 12.3282675 3.64463092 12.3282675 0.968811942 9.65244849 0.968811942 6.35165851 0.968811942 3.05086853 3.64463092 0.375049553 6.9454209 0.375049553 10.2462109 0.375049553 12.9220299 3.05086853 12.9220299 6.35165851 12.9220299 7.26156094 12.7186956 8.12397211 12.354987 8.89593202L17.4624135 13.6586842C17.4624135 13.6586842 17.5766368 15.1532905 17.3179164 15.4307342 16.9425866 15.8332262 15.5602627 15.6984912 15.5602627 15.6984912L10.6047437 11.077395 10.6047437 11.077395ZM6.9454209 10.3360645C9.14594755 10.3360645 10.9298269 8.55218516 10.9298269 6.35165851 10.9298269 4.15113185 9.14594755 2.36725254 6.9454209 2.36725254 4.74489424 2.36725254 2.96101493 4.15113185 2.96101493 6.35165851 2.96101493 8.55218516 4.74489424 10.3360645 6.9454209 10.3360645Z"/></g><path d="M138 2.5L138 25.5 138 27 141 27 141 25.5 141 2.5 141 1 138 1 138 2.5 138 2.5Z"/></g></g></g></svg>',
      },
      PaperSearchForm: {
        title: 'Paper',
        order: 3,
        path: '/paper-form',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="290px" height="246px" viewBox="0 0 290 246" version="1.1"><title>Artboard 1 Copy 2</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="2" fill="none" fill-rule="evenodd"><g><g transform="translate(80.000000, 50.000000)"><path d="M11.1420871 139.441341L0 139.441341 0 0 119.984612 0 119.984612 8.26117318" class="svg-needs-stroke"stroke-width="5" fill-opacity="0" /><g transform="translate(9.289131, 6.536313)"><rect class="svg-needs-stroke"stroke-width="5" fill-opacity="0"  x="0" y="0" width="119.984612" height="139.441341"/><rect class="svg-needs-fill" x="13.8443783" y="27.5977654" width="92.2958552" height="5.81005587"/><rect class="svg-needs-fill" x="13.8443783" y="41.396648" width="92.2958552" height="5.81005587"/><rect class="svg-needs-fill" x="13.8443783" y="55.9217877" width="92.2958552" height="5.81005587"/></g></g></g></g></svg>',
      },
    },
  });
  return PageManager;
});
