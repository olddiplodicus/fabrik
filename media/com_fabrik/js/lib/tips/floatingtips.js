/*
---
description: Class for creating floating balloon tips that nicely appears when hovering an element.

license: MIT-style

authors:
- Lorenzo Stanco

requires:
- core/1.3: '*'

provides: [FloatingTips]

...
*/

var FloatingTips = new Class({

	Implements: [Options, Events],

	options: {
		position: 'top',
		center: true,
		content: 'title',
		html: false,
		balloon: true,
		arrowSize: 32,
		arrowOffset: 6,
		distance: 3,
		motion: 6,
		motionOnShow: true,
		motionOnHide: true,
		showOn: 'mouseenter',
		hideOn: 'mouseleave',
		showDelay: 0,
		hideDelay: 0,
		className: 'floating-tip',
		offset: {x: 0, y: 0},
		fx: { 'duration': 'short' }
	},

	initialize: function(elements, options) {
		this.setOptions(options);
		if (!['top', 'right', 'bottom', 'left', 'inside'].contains(this.options.position)) this.options.position = 'top';
		if (elements) this.attach(elements);
		return this;
	},

	attach: function(elements) {
		var s = this;
		this.elements = $$(elements);
		this.elements.each(function(e) {
			evs = { };
			evs[s.options.showOn] = function() { s.show(this); };
			evs[s.options.hideOn] = function(e) {
				s.hide(e, this); };
			e.addEvents(evs);
		});
		
		return this;
	},

	show: function(element) {
		var old = element.retrieve('floatingtip');
		if (old) if (old.getStyle('opacity') == 1) { clearTimeout(old.retrieve('timeout')); return this; }
		var tip = this._create(element);
		if (tip == null) return this;
		element.store('floatingtip', tip);
		this._animate(tip, 'in');
		this.fireEvent('show', [tip, element]);
		return this;
	},
	
	hide: function(e, element) {
		if (this.elements.contains(e.target.getParent())) {
			//stops the element from being hidden if mouse over trigger
			return;
		}
		var tip = element.retrieve('floatingtip');
		if (!tip) return this;
		this._animate(tip, 'out');
		this.fireEvent('hide', [tip, element]);
		return this;
	},
	
	_create: function(elem) {
		var o = Object.clone(this.options);
		elOpts = elem.retrieve('options', JSON.decode(elem.get('opts')));
		o = Object.merge(o, elOpts);
		elem.removeProperty('opts');
		var oc = o.content;
		var opos = o.position;
		if (oc == 'title') {
			oc = 'floatingtitle';
			if (!elem.get('floatingtitle')) elem.setProperty('floatingtitle', elem.get('title'));
			elem.set('title', '');
		}
		
		var cnt = (typeof(oc) == 'string' ? elem.get(oc) : oc(elem));
		var cwr = new Element('div').addClass(o.className).setStyle('margin', 0);
		var tip = new Element('div').addClass(o.className + '-wrapper').setStyles({ 'margin': 0, 'padding': 0, 'z-index': cwr.getStyle('z-index') }).adopt(cwr);
		
		if (cnt) { 
			if (o.html) cwr.set('html', typeof(cnt) == 'string' ? cnt : cnt.get('html')); 
			else cwr.set('text', cnt); 
		} else { 
			return null;
		}
		cwr.store('trigger', elem);
		var body = document.id(document.body);
		tip.setStyles({ 'position': 'absolute', 'opacity': 0 }).inject(body);
		
		if (o.balloon && !Browser.ie6) {
			
			var trg = new Element('div').addClass(o.className + '-triangle').setStyles({ 'margin': 0, 'padding': 0 });
			trg.setStyle('z-index', tip.getStyle('z-index') -1);
			var trgSt = {};
			/*var trgSt = { 'border-color': cwr.getStyle('background-color'), 'border-width': o.arrowSize, 'border-style': 'solid','width': 0, 'height': 0 };
			
			switch (opos) {
				case 'inside': 
				case 'top': trgSt['border-bottom-width'] = 0; break;
				case 'right': trgSt['border-left-width'] = 0; trgSt['float'] = 'left'; cwr.setStyle('margin-left', o.arrowSize); break;
				case 'bottom': trgSt['border-top-width'] = 0; break;
				case 'left': trgSt['border-right-width'] = 0; 
					if (Browser.ie7) { trgSt['position'] = 'absolute'; trgSt['right'] = 0; } else { trgSt['float'] = 'right'; }
					cwr.setStyle('margin-right', o.arrowSize); break;
			}
			
			switch (opos) {
				case 'inside': case 'top': case 'bottom': 
					trgSt['border-left-color'] = trgSt['border-right-color'] = 'transparent';
					trgSt['margin-left'] = o.center ? tip.getSize().x / 2 - o.arrowSize : o.arrowOffset; break;
				case 'left': case 'right': 
					trgSt['border-top-color'] = trgSt['border-bottom-color'] = 'transparent';
					trgSt['margin-top'] = o.center ?  tip.getSize().y / 2 - o.arrowSize : o.arrowOffset; break;
			}*/
			var r = 0;
			// @TODO - margin offsets only ok if arrowSize  = 32.
			switch (opos) {
			case 'inside': 
			case 'top': 
				r = 270;
				trgSt['height'] = '20px';
				trgSt['margin-top'] = '-10px';
				trgSt['margin-left'] = o.center ? tip.getSize().x / 2 - o.arrowSize / 2: o.arrowOffset;
				break;
			case 'right': 
				r = 0;
				trgSt['float'] = 'left';
				trgSt['width'] = '20px';
				trgSt['margin-left'] = '-20px';
				trgSt['margin-top'] = o.center ?  tip.getSize().y / 2 - o.arrowSize / 2 : o.arrowOffset;
				break;
			case 'bottom': r = 90;
				trgSt['height'] = '20px';
				trgSt['margin-left'] = o.center ? tip.getSize().x / 2 - o.arrowSize / 2 : o.arrowOffset;
				break;
			case 'left': r = 180; 
				trgSt['float'] = 'right';
				trgSt['width'] = '20px';
				trgSt['margin-right'] = '-10px';
				trgSt['margin-top'] = o.center ?  tip.getSize().y / 2 - o.arrowSize / 2 : o.arrowOffset;
				break;
		}
		var scale = o.arrowSize/32;
		var borderSize = cwr.getStyle('border-width').split(' ')[0].toInt();
		var arrowStyle = {
				size: {width: 32, height: 32},
				scale: scale, 
				rotate: r,
				shadow: {
					color: '#ccc',
					translate: {x: 1, y: 1}
				},
				fill: {
					color: [ cwr.getStyle('background-color'),  cwr.getStyle('background-color')]
				}
			};
			if (borderSize !== 0) {
				arrowStyle.stroke = {
					color: cwr.getStyle('border-color').split(' ')[0],
					width: borderSize,
				}
			}
			var arrow = Fabrik.iconGen.create(icon.arrowleft, arrowStyle);
			arrow.inject(trg);
			trg.setStyles(trgSt).inject(tip, (opos == 'top' || opos == 'inside') ? 'bottom' : 'top');
			
		}
		
		var tipSz = tip.getSize(), trgC = elem.getCoordinates(body);
		var pos = { x: trgC.left + o.offset.x, y: trgC.top + o.offset.y };
		
		if (opos == 'inside') {
			tip.setStyles({ 'width': tip.getStyle('width'), 'height': tip.getStyle('height') });
			elem.setStyle('position', 'relative').adopt(tip);
			pos = { x: o.offset.x, y: o.offset.y };
		} else {
			switch (opos) {
				case 'top':     pos.y -= tipSz.y + o.distance; break;
				case 'right': 	pos.x += trgC.width + o.distance; break;
				case 'bottom': 	pos.y += trgC.height + o.distance; break;
				case 'left': 	pos.x -= tipSz.x + o.distance; break;
			}
		}
		
		if (o.center) {
			switch (opos) {
				case 'top': case 'bottom': pos.x += (trgC.width / 2 - tipSz.x / 2); break;
				case 'left': case 'right': pos.y += (trgC.height / 2 - tipSz.y / 2); break;
				case 'inside':
					pos.x += (trgC.width / 2 - tipSz.x / 2);
					pos.y += (trgC.height / 2 - tipSz.y / 2); break;
			}
		}
		
		tip.set('morph', o.fx).store('position', pos);
		tip.setStyles({ 'top': pos.y, 'left': pos.x });
		elem.store('options', o);
		tip.store('options', o);
		tip.addEvent('mouseleave', function(e){
			this.hide(e, elem);
		}.bind(this));
		return tip;
		
	},
	
	_animate: function(tip, d) {
		
		clearTimeout(tip.retrieve('timeout'));
		tip.store('timeout', (function(t) { 
			
			var o = tip.retrieve('options'), din = (d == 'in');
			var m = { 'opacity': din ? 1 : 0 };
			
			if ((o.motionOnShow && din) || (o.motionOnHide && !din)) {
				var pos =  t.retrieve('position');
				if (!pos) return;
				switch (o.position) {
					case 'inside': 
					case 'top':		m['top']  = din ? [pos.y - o.motion, pos.y] : pos.y - o.motion; break;
					case 'right': 	m['left'] = din ? [pos.x + o.motion, pos.x] : pos.x + o.motion; break;
					case 'bottom': 	m['top']  = din ? [pos.y + o.motion, pos.y] : pos.y + o.motion; break;
					case 'left': 	m['left'] = din ? [pos.x - o.motion, pos.x] : pos.x - o.motion; break;
				}
			}
			
			t.morph(m);
			if (!din) t.get('morph').chain(function() { this.dispose(); }.bind(t)); 
			
		}).delay((d == 'in') ? this.options.showDelay : this.options.hideDelay, this, tip));
		
		return this;
		
	}

});
