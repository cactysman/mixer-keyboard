/* tslint:disable:no-console */

const debug: boolean = false;

// Imports
import * as WebSocket from 'ws';
import {
	GameClient,
	IButton,
	setWebSocket,
} from 'beam-interactive-node2';


// npm packets
let path = require('path');


// Load functions
const Functions = require('./lib/functions');


// Make sure we got all the info we need
if (process.argv.length < 3) {
	console.error(`Usage: node ${path.basename(__filename)} <profile.json>`);
	process.exit(1);
}


// Distribute arg vars
const profileFilePath: string = process.argv[2];


// Load profile
const profile: any = Functions.loadFile(profileFilePath, 'profile');
const auth: any = Functions.loadFile(path.dirname(profileFilePath) + '/' + profile.auth, 'auth');
const layout: any = Functions.loadFile(path.dirname(profileFilePath) + '/' + profile.layout, 'layout');
const mapping: any = Functions.loadFile(path.dirname(profileFilePath) + '/' + profile.mapping, 'mapping');
const versionID: number = profile.versionID;

const handlers: any = {};
const participantList: any = {};


// Construct client
const client = new GameClient();
client.on('message', (err: any) => { if(debug)console.log('<<<', err) });
client.on('send', (err: any) => { if(debug)console.log('>>>', err) });
client.on('error', (err: any) => { if(debug)console.log(err) });
client.on('open', () => console.log('Connected to interactive'));
setWebSocket(WebSocket);


// Connect to interactive
client.open({
	authToken: auth.oauth,
	versionId: versionID,
}).then(() => {
	// Load handlers
	for(let handlerName in profile.handlers) {
		let handler = Functions.getHandler(profile.handlers[handlerName], path.dirname(profileFilePath), handlerName);
		if(handler != null) {
			handlers[handlerName] = handler;
		}
	}

	// Create our controls
	return client.createControls({
		sceneID: 'default',
		controls: Functions.makeControls(layout.layout.default),
	});
}).then(controls => {
	controls.forEach((control: IButton) => {
		control.on('mousedown', (inputEvent, participant) => {
			const keyConfig = mapping[inputEvent.input.controlID];
			if(keyConfig != null) {
				if(handlers['button'] != null)
				{
					handlers['button'].handle(inputEvent, participant, keyConfig);
				}
			}

			if(inputEvent.transactionID) {
				client.captureTransaction(inputEvent.transactionID)
					.then(() => {
						console.log(`[SPRK] ${participant.username}, ${control.cost}`);
					});
			}
		});
		control.on('mouseup', (inputEvent, participant) => {
			const keyCode = mapping[inputEvent.input.controlID];
			if(keyCode != null) {
				if(handlers['button'] != null)
				{
					handlers['button'].handle(inputEvent, participant, keyCode);
				}
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
