define([
	'store',
	'keyboard',
	'ui/dialog/Dialogs',
	'ui/exports/Exports'
], function(store, HotKey, Dialogs, Exports) {
	var gui = require('nw.gui');
	var win = gui.Window.get();

	var orgTitle = 'Untitled';
	var edited = false,
		delayClose = false;

	var config = store.get('Window') || {};

	if (config.isFullscreen) {
		setTimeout(function() {
			win.enterFullscreen();
		}, 150);
	} else {
		nw.resizeTo(config.width, config.height);
	}

	function close() {
		nw.emit('destory');
		
		win.hide();

		if (!win.isFullscreen) {
			config.width = win.width;
			config.height = win.height;
			config.x = win.x;
			config.y = win.y;
		}

		config.zoom = win.zoom;
		config.isFullscreen = win.isFullscreen;
		store.set('Window', config);

		win.close(true);
	}

	win.on('close', function() {
		if (edited) {
			delyClose = true;
			Dialogs.save.show();
			return;
		} else {
			close();
		}
	});

	Dialogs.save.bind('save', function() {
		delayClose = true;
		window.ee.emit('menu.file.save');
	});

	Dialogs.save.bind('dont-save', function() {
		close();
	});

	var reloadFile;
	Dialogs.reload.bind('reload', function() {
		window.ee.emit('reload');
		// window.parent.ee.emit('file.reload', reloadFile, function(err, data) {
		// 	window.ee.emit('file.reloaded', data);
		// });
	});

	window.ee.on('file.update', function(file) {
		reloadFile = file;
		Dialogs.reload.show(file);
	});

	window.ee.on('file.close', function() {
		win.close();
	});

	nw.on('file.opened', function(file) {
		var opt = file.toJSON();

		if (opt.tmp) {
			nw.title = 'Restored (written at ' + opt.ctime + ')';
		} else {
			nw.title = orgTitle = opt.basename || orgTitle;
		}

		if (opt.readOnly) {
			nw.title += ' (read only)';
		}
	});
	// window.ee.on('file.opened', function(opt) {
	// 	win.title = orgTitle = opt.basename || orgTitle;

	// 	if (win._params.readOnly) {
	// 		win.title += ' (read only)';
	// 	}
	//  	});

	nw.on('file.saved', function(opt) {
		win.title = orgTitle = opt.basename;

		if (delayClose) {
			close();
		}

		delayClose = false;
		edited = false;
	});

	window.ee.on('change.before.markdown', function(markdown, html, editor) {
		win.title = orgTitle + ' (edited)';
		edited = true;
	});

	window.addEventListener('keydown', function(e) {

		var evt = document.createEvent("Events");
		evt.initEvent("keydown", true, true);

		evt.view = e.view;
		evt.altKey = e.altKey;
		evt.ctrlKey = e.ctrlKey;
		evt.shiftKey = e.shiftKey;
		evt.metaKey = e.metaKey;
		evt.keyCode = e.keyCode;
		evt.charCode = e.charCode;

		window.parent.dispatchEvent(evt);

	}, false);

	$('#editor').bind('contextmenu', function(e, ev) {
		var x, y;
		e.preventDefault();

		e = (ev) ? ev : e;

		x = win.x - window.parent.screenX + e.clientX;
		y = win.y - window.parent.screenY + e.clientY;

		switch (process.platform) {
			case 'linux':
				y += 28;
				break;
			default:
				break;
		}

		x = (ev) ? x + $('#editor').width() : x;

		//fixed #135
		if (win.isFullscreen) {

			switch (process.platform) {
				case 'win32':
					y -= 49;
					x -= 7;
					break;
				case 'linux':
					y -= 28;
					break;
				default:
					y -= 20;
					break;
			}
		}

		if (ev) {
			window.parent.ee.emit('popup.context.viewer', x, y);
		} else {
			window.parent.ee.emit('popup.context.editor', x, y);
		}

		return false;
	});


	var resizeTimeout;
	window.onresize = function(e) {

		clearTimeout(resizeTimeout);

		resizeTimeout = setTimeout(function() {
			config.width = win.width;
			config.height = win.height;
			config.x = win.x;
			config.y = win.y;

			store.set('Window', config);
		}, 250);

	}

	win.on('enter-fullscreen', function() {
		document.querySelector('.CodeMirror-gutters').style.height = '3000px';

  	global._gaq.push('haroopad.window', 'fullscreen', 'true');
	});

	win.on('leave-fullscreen', function() {

  	global._gaq.push('haroopad.window', 'fullscreen', 'false');
		// config.isFullscreen = win.isFullscreen;
		// store.set('Window', config);
	});

	window.ee.on('view.fullscreen', function() {
		var isFull = win.isFullscreen;

		if (isFull) {
			win.leaveFullscreen();
			config.isFullscreen = win.isFullscreen;
			store.set('Window', config);
		} else {
			/* codemirror redraw delay bug */
			// document.querySelector('.CodeMirror-gutters').style.height = '3000px';
			win.enterFullscreen();
		}
	});

	/* update haroopad */
	window.ee.on('update.haroopad', function(currVersion, newVersion, link) {
		Notifier.notify('Looking for the latest version? <a href="#" data-href="release.note.haroopad">release note</a>, <a href="#" data-href="download.haroopad">download</a>', 'Update Haroopad v' + newVersion, undefined, 10000);
	});

	/* up to date haroopad */
	window.ee.on('up.to.date.haroopad', function(version) {
		Notifier.notify('Haroopad <strong>v' + version + '</strong> is currently the newest version available.', 'You\'re up to date!', undefined, 5000);
	});

	HotKey('defmod-enter', function() {
		window.ee.emit('view.fullscreen');
	});

	HotKey('defmod-f11', function() {
		window.ee.emit('view.fullscreen');
	});

	HotKey('esc esc', function() {
		if (win.isFullscreen) {
			win.leaveFullscreen();
			config.isFullscreen = win.isFullscreen;
			store.set('Window', config);
		}
	});

	HotKey('defmod-o', function() {
		window.ee.emit('menu.file.open');
	});

	HotKey('defmod-s', function() {
		window.ee.emit('menu.file.save');
	});

	HotKey('defmod-shift-s', function() {
		window.ee.emit('menu.file.save.as');
	});

	HotKey('defmod-w', function() {
		nw.emit('close');
	});

	HotKey('defmod-f4', function() {
		nw.emit('close');
	});

	HotKey('defmod-alt-e', function() {
		window.ee.emit('file.exports.html');

  	global._gaq.push('haroopad.file', 'exports', 'html');
	});

	
	window.ondragover = function(e) { e.preventDefault(); return false };
	window.ondrop = function(e) { e.preventDefault(); return false };
});