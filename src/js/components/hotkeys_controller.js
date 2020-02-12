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
      hotkeys('shift+right,;', this.createEvent('hotkey/next'));
      hotkeys('shift+left,l', this.createEvent('hotkey/prev'));
      hotkeys('down,j', this.createEvent('hotkey/item-next'));
      hotkeys('up,k', this.createEvent('hotkey/item-prev'));
      hotkeys('space', this.createEvent('hotkey/item-select'));
    },
    hardenedInterface: {},
  });

  _.extend(HotkeysController.prototype, Dependon.BeeHive, Hardened);

  return HotkeysController;
});
