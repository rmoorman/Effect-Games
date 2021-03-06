// Effect Games Engine v1.0
// Copyright (c) 2005 - 2011 Joseph Huckaby
// Source Code released under the MIT License: 
// http://www.opensource.org/licenses/mit-license.php

////
// Flash.js
// Provides video playback services through Flash 9 / ActionScript 3
////

function _FlashVideoClip(_handler, _id) {
	// class constructor
	this.handler = _handler;
	this.id = _id;
	this.volume = 1.0;
	this.balance = 0.0;
};

_FlashVideoClip.prototype._init = function() {
	// init clip and create movie in main port
	var _div = this.div = document.createElement('div');
	var _style = this.style = _div.style;
	_style.position = 'absolute';
	// _style.left = '-300px';
	// _style.top = '-300px';
	_style.left = '0px';
	_style.top = '0px';
	_style.width = '1px';
	_style.height = '1px';

	gPort.div.appendChild(_div);
	_div.innerHTML = this._get_html(1,1) + 
		'<div id="d_video_overlay_'+this.id+'" style="position:absolute; left:0px; top:0px; width:1px; height:1px; z-index:2"></div>';
};

_FlashVideoClip.prototype._reset = function() {
	// restore clip to its hidden, shrunk state
	this._stop();
	this._deactivate();
	this._set_size(1, 1);
	this.style.left = '-300px';
	this.style.top = '-300px';
};

_FlashVideoClip.prototype._notify = function(_type, _msg) {
	switch (_type) {
		case 'flashLoadComplete':
			var _self = this;
			setTimeout( function() {
				_self.loaded = true;
				_self.movie = document.getElementById('swf_effect_video_'+_self.id);
				if (_self.handler.fireHandler) _self.handler.fireHandler('onPlayerLoad', _self.id);
			}, 1 );
			break;
		
		case 'error':
			_throwError("Video Clip Error: " + this.id + ": " + _msg);
			break;
		
		case 'debug':
			Debug.trace('video', this.id + ": " + _msg);
			break;
		
		case 'clipInfo':
			Debug.trace('video', "Received Clip Info: " + _msg);
			this.metadata = _parse_query_string( _msg );
			break;
		
		default:
			// unknown event type, pass along to handler
			var _video = Effect.VideoManager._videos[ this.id ];
			if (_video.handler.fireHandler) _video.handler.fireHandler(_type, this.id, _msg);
			break;
	}
};

_FlashVideoClip.prototype._getAdjVolume = function() {
	// get volume adjusted for video category
	if (!gAudio.enabled || !gAudio._categorySettings['video'].enabled) return 0.0;
	return ( this.volume * gAudio._getAdjCategoryVolume('video') );
};

_FlashVideoClip.prototype._getAdjBalance = function() {
	// get balance
	return ( this.balance );
};

_FlashVideoClip.prototype._get_html = function(_width, _height) {
	// return HTML for rendering flash movie
	var _html = '';
	var _flashvars = 'id=' + this.id + 
		'&width=' + _width + 
		'&height=' + _height + 
		'&volume=' + this._getAdjVolume() + 
		'&balance=' + this._getAdjBalance() + 
		'&smoothing=' + ((gGame._def.ZoomFilter == 'Smooth') ? 1 : 0);
	
	if (ua.ie) {
		_html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+_protocol+'://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+_width+'" height="'+_height+'" id="swf_effect_video_'+this.id+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+Effect.VideoManager._movieURL+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+_flashvars+'"/><param name="wmode" value="transparent"/></object>';
	}
	else {
		_html += '<embed id="swf_effect_video_'+this.id+'" src="'+Effect.VideoManager._movieURL+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+_width+'" height="'+_height+'" name="swf_effect_video_'+this.id+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+_flashvars+'" wmode="transparent" />';
	}
	
	return _html;
};

_FlashVideoClip.prototype._load = function(_url, _loop) {
	if (!_loop) _loop = false;
	this.movie.v_load( gGame.getGamePath() + _url + '?mod=' + gGame._assetModDate + '&ttl=static', _loop );
};

_FlashVideoClip.prototype._play = function() {
	this.movie.v_play();
	this.movie.v_set_volume( this._getAdjVolume() );
};

_FlashVideoClip.prototype._stop = function() {
	this.movie.v_stop();
};

_FlashVideoClip.prototype._rewind = function() {
	this.movie.v_rewind();
};

_FlashVideoClip.prototype._set_active = function(_url) {
	if (!this.movie.v_set_active( gGame.getGamePath() + _url + '?mod=' + gGame._assetModDate + '&ttl=static')) {
		_throwError("Unable to set active video clip: " + _url);
	}
};

_FlashVideoClip.prototype._deactivate = function() {
	this.movie.v_deactivate();
};

_FlashVideoClip.prototype._get_position = function() {
	return this.movie.v_get_position();
};

_FlashVideoClip.prototype._set_position = function(pos) {
	this.movie.v_set_position(pos);
};

_FlashVideoClip.prototype._get_load_progress = function() {
	if (!this.loaded) return 0.0;
	return this.movie.v_get_load_progress();
};

_FlashVideoClip.prototype._set_size = function(_width, _height) {
	this.movie.style.width = '' + _width + 'px';
	this.movie.style.height = '' + _height + 'px';
	this.movie.v_set_size(_width, _height);
	
	var _overlay = el('d_video_overlay_'+this.id);
	if (_overlay) {
		_overlay.style.width = '' + _width + 'px';
		_overlay.style.height = '' + _height + 'px';
	}
};

_FlashVideoClip.prototype._set_loop = function(_loop) {
	this.movie.v_set_loop( !!_loop );
};

_FlashVideoClip.prototype._set_volume = function(_vol) {
	// set clip volume
	this.volume = _vol;
	if (this.movie) this.movie.v_set_volume( this._getAdjVolume() );
};

_FlashVideoClip.prototype._update_volume = function() {
	// refresh clip volume (category settings may have changed)
	if (this.movie) this.movie.v_set_volume( this._getAdjVolume() );
};
