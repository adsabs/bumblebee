define(['marionette', 'hbs!../templates/list-template', 'hbs!../templates/no-items-template', 'js/widgets/results-render/views/results-render-item-view'],
    function(Marionette, listTemplate, noItemsTemplate, ResultsItemView) {

        NoItemsView = Backbone.Marionette.ItemView.extend({
            template: noItemsTemplate
        });

        var ResultsListView = Marionette.CompositeView.extend({
            template: listTemplate,
            itemView: ResultsItemView,
            itemViewContainer: "#results",
            emptyView: NoItemsView

        });

        return ResultsListView
    }

)