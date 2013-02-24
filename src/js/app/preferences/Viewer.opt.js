define([
		'store'
	], function(store) {
		var Model = Backbone.Model.extend({
			defaults: {
				viewStyle: 'default',
				codeStyle: 'default',
				clickableLink: false
			},

			// localStorage: new Backbone.LocalStorage('General'),
			initialize: function() {
				var opt = store.get('Viewer');

				this.bind('change', function() {
					store.set('Viewer', this.toJSON());
				});

				if(opt) {
					this.set(opt);
				} else {
					this.set(this.defaults);
				}
			}
		});

		return new Model();
});