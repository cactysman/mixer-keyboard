#!/usr/bin/env node

// /* tslint:disable:no-console */

import * as WebSocket from 'ws';
import { GameClient, IButton, setWebSocket } from 'beam-interactive-node2';

import { Functions } from "../lib/functions";
import { AbstractHandler } from "../lib/handler/AbstractHandler";
export { AbstractHandler } from "../lib/handler/AbstractHandler";

process.on('unhandledRejection', r => console.log(r));

const _debug: boolean = false;


// npm packets
let path = require('path');


// Make sure we got all the info we need
if (process.argv.length < 3) {
	console.error(`Usage: node ${path.basename(__filename)} <profile.json>`);
	process.exit(1);
}


// Distribute arg vars
let _profileFilePath: string = path.normalize(process.argv[2]);
const profileFilePath = path.isAbsolute(_profileFilePath) ? _profileFilePath : path.normalize(path.join(process.cwd(), _profileFilePath));

// Load profile
const profile: any = Functions.loadFile(profileFilePath, 'profile', process.cwd());
const auth: any = Functions.loadFile(profile.auth, 'auth', path.dirname(profileFilePath));
const layout: any = Functions.loadFile(profile.layout, 'layout', path.dirname(profileFilePath));
const mapping: any = Functions.loadFile(profile.mapping, 'mapping', path.dirname(profileFilePath));
const versionID: number = profile.versionID;

const handlers: { property: AbstractHandler } = { property: null };
const participantList: any = {};


// Construct client
const client = new GameClient();
client.on('message', (err: any) => { if(_debug)console.log('<<<', err) });
client.on('send', (err: any) => { if(_debug)console.log('>>>', err) });
client.on('error', (err: any) => { if(_debug)console.log(err) });
client.on('open', () => console.log('Connected to interactive'));
setWebSocket(WebSocket);
Functions.setClient(client);


// Connect to interactive
client.open({
	authToken: auth.oauth,
	versionId: versionID,
}).then(() => {
	// Load handlers
	for(let handlerName in profile.handlers) {
		if(profile.handlers.hasOwnProperty(handlerName)) {
			let handler = Functions.getHandler(profile.handlers[handlerName], path.dirname(profileFilePath), handlerName);
			if(handler != null) {
				handlers[handlerName] = handler;
			}
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
			const controlConfig = mapping[inputEvent.input.controlID];
			if(controlConfig != null) {
				if(handlers['button'] != null) {
					handlers['button'].handle(control, inputEvent, participant, controlConfig);
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
			const controlConfig = mapping[inputEvent.input.controlID];
			if(controlConfig != null) {
				if(handlers['button'] != null) {
					handlers['button'].handle(control, inputEvent, participant, controlConfig);
				}
			}
		});
	});

	client.ready(true)
		.then()
	;
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
