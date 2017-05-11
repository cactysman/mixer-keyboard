import {IButtonInput, IInputEvent, IParticipant} from "beam-interactive-node2";
let robot = require('robotjs');

class Handler {
	public handle(event: IInputEvent<IButtonInput>, participant: IParticipant, actionConfig: any) {
		console.log(`[BUTT][${event.input.event == 'mousedown' ? '▼' : '▲'}] ${participant.username}, ${event.input.controlID}`);
		robot.keyToggle(actionConfig, event.input.event.replace('mouse', ''));
	};
}

exports.Handler = Handler;