import {IButtonInput, IInputEvent, IParticipant} from "beam-interactive-node2";

class Handler {
	public handle(event: IInputEvent<IButtonInput>, participant: IParticipant, actionConfig: any) {
		console.log(`[BUTT][${event.input.event == 'mousedown' ? '▼' : '▲'}] ${participant.username}, ${event.input.controlID}`);
	};
}

exports.Handler = Handler;