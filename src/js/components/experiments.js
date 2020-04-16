define(['underscore', 
        'jquery',
        'js/components/generic_module',
        'js/mixins/dependon',
        'analytics'], 
        function(_, 
                 $,
                 GenericModule,
                 Dependon,
                 analytics
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

            if (!window.gtag) {
                window.gtag = function () {dataLayer && dataLayer.push(arguments)}
                gtag('event', 'optimize.callback', {
                    callback: (value, name) => { console.log(
                        'Experiment with ID: ' + name + ' is on variant: ' + value);
                        setTimeout(function() {
                            // temporary workaround
                            if (value === '2') {
                                document.getElementById('recommender').getElementsByTagName('a')[0].click()
                            }
                            else {
                                document.getElementById('recommender').getElementsByTagName('a')[1].click()
                            }
                        }, 1000);
                    }
                });

            }
            
            this.toggleOptimize();
            
        },

        toggleOptimize: function() {
            if (!dataLayer) {
                console.warn('Optimize is not available, we are not running any experiment');
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