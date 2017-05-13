import {GameClient, IButton, IButtonInput, IInputEvent, IParticipant} from "beam-interactive-node2";

export abstract class AbstractHandler {
	private client: GameClient;

	constructor(client: GameClient, config: any = {}) {
		this.client = client;
	}

	public handle(control: IButton, event: IInputEvent<IButtonInput>, participant: IParticipant, actionConfig: any){}
}