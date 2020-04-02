define(['underscore', 
        'jquery',
        'js/components/generic_module',
        'js/mixins/dependon'], 
        function(_, 
                 $,
                 GenericModule,
                 Dependon
                 ) {
    
    var Experiments = GenericModule.extend({
        initialize: function() {
          // store all metadata entries here
          this.isRunning = false;
        },
    
        activate: function(beehive, app) {
            this.setApp(app);
            this.setBeeHive(beehive);
            var pubsub = this.getPubSub();
            pubsub.subscribe(
                pubsub.ARIA_ANNOUNCEMENT,
                _.bind(this.onAppStarted, this)
            );
          },
    
        onAppStarted: function() {
            this.toggleOptimize();
            //var self = this;
            //setTimeout(function() {self.toggleOptimize(), 1000}); // won't be necessary if I knew what event to listen to...
            
        },

        toggleOptimize: function() {
            if (dataLayer === null) {
                console.warn('Optimize is not available');
                return;
            }

            if (this.isRunning) {
                dataLayer.push({'event': 'optimize.deactivate'});
            }
            else {
                dataLayer.push({'event': 'optimize.activate'});
            }
            this.isRunning = !this.isRunning;
        }
    });
    _.extend(Experiments.prototype, Dependon.BeeHive, Dependon.App);

    return Experiments;
});