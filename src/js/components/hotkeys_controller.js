define([
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/mixins/hardened',
  'hotkeys',
], function(GenericModule, Dependon, Hardened, hotkeys) {
  const HotkeysController = GenericModule.extend({
    initialize() {},
    createEvent(name) {
      const ps = this.getPubSub();
      return (e) => {
        ps.publish(ps.CUSTOM_EVENT, name, e);
      };
    },
    activate(beehive) {
      this.setBeeHive(beehive);
      hotkeys('shift+s', this.createEvent('hotkey/search'));
      hotkeys('right', this.createEvent('hotkey/next'));
      hotkeys('left', this.createEvent('hotkey/prev'));
      hotkeys('down, alt+shift+down', this.createEvent('hotkey/item-next'));
      hotkeys('up, alt+shift+up', this.createEvent('hotkey/item-prev'));
      hotkeys('space, alt+shift+s', this.createEvent('hotkey/item-select'));
      hotkeys('shift+`', this.createEvent('hotkey/show-help'));
    },
    hardenedInterface: {},
  });

  _.extend(HotkeysController.prototype, Dependon.BeeHive, Hardened);

  return HotkeysController;
});
