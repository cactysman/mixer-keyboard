"use strict";
var Handler = (function () {
	function Handler() {
	}
	Handler.prototype.handle = function (event, participant, actionConfig) {
		console.log("[BUTT][" + (event.input.event == 'mousedown' ? '▼' : '▲') + "] " + participant.username + ", " + event.input.controlID);
	};
	;
	return Handler;
}());
exports.Handler = Handler;
