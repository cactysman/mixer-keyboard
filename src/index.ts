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
let fetch = require('node-fetch');


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
setWebSocket(WebSocket);


// Get auth info
let auth = require('./config/auth.json').oauth;


// Get the interactive host address
fetch('https://beam.pro/api/v1/interactive/hosts')
	.then((res) => { return res.json(); })
	.then(function(interactiveHosts) {
		client.open({
			authToken: auth,
			url: interactiveHosts[0].address,
			versionId: versionID,
		});
	});


function makeControls(controlsConfig: any): IControlData[] {
	const controls: IButtonData[] = [];
	for (let i = 0; i < controlsConfig.length; i++) {
		controls.push(controlsConfig[i]);
	}
	return controls;
}

// Wait for interactive to connect
// then start all the other things
client.on('open', () => {
	console.log('Connected to interactive');

	const controlsLayout = require(layoutFile);
	const controlsMapping = require(mappingFile);

	client.createControls({
		sceneID: 'default',
		controls: makeControls(controlsLayout.layout.default),
	}).then(controls => {
		controls.forEach((control: IButton) => {
			control.on('mousedown', (inputEvent, participant) => {
				console.log(`[BUTT][v] ${participant.username}, ${inputEvent.input.controlID}`);

				const keyCode = controlsMapping[inputEvent.input.controlID];
				if(keyCode != null) {
					robot.keyToggle(keyCode, 'down');
				}

				if (inputEvent.transactionID) {
					client.captureTransaction(inputEvent.transactionID)
						.then(() => {
							console.log(`[SPRK] ${participant.username}, ${control.cost}`);
						});
				}
			});
			control.on('mouseup', (inputEvent, participant) => {
				console.log(`[BUTT][^] ${participant.username}, ${inputEvent.input.controlID}`);
				
				const keyCode = controlsMapping[inputEvent.input.controlID];
				if(keyCode != null) {
					robot.keyToggle(keyCode, 'up');
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
});


/* tslint:enable:no-console */
