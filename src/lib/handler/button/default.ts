import {IButton, IButtonInput, IInputEvent, IParticipant} from "beam-interactive-node2";
import {AbstractHandler} from "../AbstractHandler";

class DefaultButtonHandler extends AbstractHandler {
	public handle(control: IButton, event: IInputEvent<IButtonInput>, participant: IParticipant, actionConfig: any) {
		console.log(`[BUTT][${event.input.event == 'mousedown' ? '▼' : '▲'}] ${participant.username}, ${event.input.controlID}`);
	};
}
exports.Handler = DefaultButtonHandler;