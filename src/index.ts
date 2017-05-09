/* tslint:disable:no-console */

const debug: boolean = false;

// Imports
import * as WebSocket from 'ws';
import {
	GameClient,
	IButton, IButtonData, IControlData,
	setWebSocket,
} from 'beam-interactive-node2';


// npm packets
let robot = require('robotjs');
let path = require('path');


// Make sure we got all info we need
if (process.argv.length < 3) {
	console.log(`Usage: node ${path.basename(__filename)} <versionID> <layoutFile> <mappingFile>`);
}


// Distribute arg vars
const layoutFile: string = process.argv[2];
const mappingFile: string = process.argv[3];
const versionID: number = parseInt(process.argv[4]);
const participantList: any = {};


// Construct client
const client = new GameClient();
client.on('message', (err: any) => { if(debug)console.log('<<<', err) });
client.on('send', (err: any) => { if(debug)console.log('>>>', err) });
client.on('error', (err: any) => { if(debug)console.log(err) });
client.on('open', () => console.log('Connected to interactive'));
setWebSocket(WebSocket);


// Get auth info
let auth = require('./config/auth.json').oauth;


function makeControls(controlsConfig: any): IControlData[] {
	const controls: IButtonData[] = [];
	for (let i = 0; i < controlsConfig.length; i++) {
		controls.push(controlsConfig[i]);
	}
	return controls;
}

// Connect to interactive
client.open({
	authToken: auth,
	versionId: versionID,
}).then(() => {
	// Create our controls
	const controlsLayout = require(layoutFile);

	return client.createControls({
		sceneID: 'default',
		controls: makeControls(controlsLayout.layout.default),
	});
}).then(controls => {
	const controlsMapping = require(mappingFile);
	
	controls.forEach((control: IButton) => {
		control.on('mousedown', (inputEvent, participant) => {
			const keyCode = controlsMapping[inputEvent.input.controlID];
			if(keyCode != null) {
				robot.keyToggle(keyCode, 'down');
				console.log(`[BUTT][v] ${participant.username}, ${inputEvent.input.controlID}`);
			}

			if(inputEvent.transactionID) {
				client.captureTransaction(inputEvent.transactionID)
					.then(() => {
						console.log(`[SPRK] ${participant.username}, ${control.cost}`);
					});
			}
		});
		control.on('mouseup', (inputEvent, participant) => {
			const keyCode = controlsMapping[inputEvent.input.controlID];
			if(keyCode != null) {
				robot.keyToggle(keyCode, 'up');
				console.log(`[BUTT][^] ${participant.username}, ${inputEvent.input.controlID}`);
			}
		});
	});

	client.ready(true);
});

client.state.on('participantJoin', participant => {
	console.log(`[JOIN] ${participant.username}`);

	participantList[participant.sessionID] = participant;

});
client.state.on('participantLeave', (participantSessionID: string ) => {
	let participantName = participantList[participantSessionID].username;
	console.log(`[PART] ${participantName}`);
});


/* tslint:enable:no-console */
