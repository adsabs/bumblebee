define([
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/mixins/hardened',
  'js/components/api_feedback',
  'hotkeys',
], function(GenericModule, Dependon, Hardened, ApiFeedback, hotkeys) {
  const HOTKEYS = [
    { hotkey: 'shift+s', event: 'search', description: 'Focus on search bar' },
    { hotkey: 'left', event: 'prev', description: 'Previous results page' },
    { hotkey: 'right', event: 'next', description: 'Next results page' },
    {
      hotkey: 'down, alt+shift+down',
      event: 'item-next',
      description: 'Focus on next result entry',
    },
    {
      hotkey: 'up, alt+shift+up',
      event: 'item-prev',
      description: 'Focus on previous result entry',
    },
    {
      hotkey: 'space, alt+shift+s',
      event: 'item-select',
      description: 'Select currently focused result entry',
    },
    { hotkey: 'shift+`', event: 'show-help', description: 'Show help dialog' },
  ];

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
      HOTKEYS.forEach(({ hotkey, event }) => {
        hotkeys(hotkey, this.createEvent(`hotkey/${event}`));
      });
      const ps = this.getPubSub();
      ps.subscribe(ps.CUSTOM_EVENT, (e) => {
        if (e === 'hotkey/show-help') {
          this.showHelpModal();
        }
      });
    },
    getHotkeys() {
      return HOTKEYS;
    },
    showHelpModal() {
      var pubsub = this.getPubSub();
      pubsub.publish(
        pubsub.FEEDBACK,
        new ApiFeedback({
          code: ApiFeedback.CODES.ALERT,
          msg: this.getModalMessage(),
          title: 'Hotkeys',
          modal: true,
        })
      );
    },
    getModalMessage() {
      return [
        '<dl style="display: flex; flex-flow: row wrap;">',
        ...HOTKEYS.map(({ hotkey, description }) => {
          const hotkeyList = hotkey
            .split(', ')
            .map((c) => `<code>${c}</code>`)
            .join(', ');
          return `
            <dt style="flex-basis: 40%; text-align: right; padding-right: 10px">${hotkeyList}</dt>
            <dd style="flex-basis: 60%">${description}</dd>
          `;
        }),
        '</dl>',
      ].join('');
    },
    hardenedInterface: {},
  });

  _.extend(HotkeysController.prototype, Dependon.BeeHive, Hardened);

  return HotkeysController;
});
