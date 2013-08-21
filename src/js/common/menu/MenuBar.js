window.MenuBar = function() {
	var gui = require('nw.gui'),
			win = gui.Window.get();

	var menu = MenuBar._systemMenu;

	function create() {
		menu = new gui.Menu({
		    type:   'menubar'
		});
		
		// menu.append( MenuBarFile() );
		menu.append( MenuBarFind() );
		menu.append( MenuBarView() );
		menu.append( MenuBarAction() );
		// menu.append( MenuBarTools() );

		win.menu = MenuBar._systemMenu = menu;
		win.menu.insert( MenuBarFile(), 1 );
		win.menu.append( MenuBarHelp() );
	}

	create();
};