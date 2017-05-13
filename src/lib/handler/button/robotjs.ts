import {IButton, IButtonInput, IInputEvent, IParticipant} from "beam-interactive-node2";
import {AbstractHandler} from "../AbstractHandler";

let robot = require('robotjs');

class RobotJsButtonHandler extends AbstractHandler {
	public handle(control: IButton, event: IInputEvent<IButtonInput>, participant: IParticipant, actionConfig: any) {
		console.log(`[BUTT][${event.input.event == 'mousedown' ? '▼' : '▲'}] ${participant.username}, ${event.input.controlID}`);
		robot.keyToggle(actionConfig, event.input.event.replace('mouse', ''));
	};
}

exports.Handler = RobotJsButtonHandler;