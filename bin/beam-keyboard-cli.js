#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var beam_interactive_node2_1 = require("beam-interactive-node2");
var functions_1 = require("../lib/functions");
var AbstractHandler_1 = require("../lib/handler/AbstractHandler");
exports.AbstractHandler = AbstractHandler_1.AbstractHandler;
process.on('unhandledRejection', function (r) { return console.log(r); });
var _debug = false;
// npm packets
var path = require('path');
// Make sure we got all the info we need
if (process.argv.length < 3) {
    console.error("Usage: node " + path.basename(__filename) + " <profile.json>");
    process.exit(1);
}
// Distribute arg vars
var _profileFilePath = path.normalize(process.argv[2]);
var profileFilePath = path.isAbsolute(_profileFilePath) ? _profileFilePath : path.normalize(path.join(process.cwd(), _profileFilePath));
// Load profile
var profile = functions_1.Functions.loadFile(profileFilePath, 'profile', process.cwd());
var auth = functions_1.Functions.loadFile(profile.auth, 'auth', path.dirname(profileFilePath));
var layout = functions_1.Functions.loadFile(profile.layout, 'layout', path.dirname(profileFilePath));
var mapping = functions_1.Functions.loadFile(profile.mapping, 'mapping', path.dirname(profileFilePath));
var versionID = profile.versionID;
var handlers = { property: null };
var participantList = {};
// Construct client
var client = new beam_interactive_node2_1.GameClient();
client.on('message', function (err) { if (_debug)
    console.log('<<<', err); });
client.on('send', function (err) { if (_debug)
    console.log('>>>', err); });
client.on('error', function (err) { if (_debug)
    console.log(err); });
client.on('open', function () { return console.log('Connected to interactive'); });
beam_interactive_node2_1.setWebSocket(WebSocket);
functions_1.Functions.setClient(client);
// Connect to interactive
client.open({
    authToken: auth.oauth,
    versionId: versionID,
}).then(function () {
    // Load handlers
    for (var handlerName in profile.handlers) {
        if (profile.handlers.hasOwnProperty(handlerName)) {
            var handler = functions_1.Functions.getHandler(profile.handlers[handlerName], path.dirname(profileFilePath), handlerName);
            if (handler != null) {
                handlers[handlerName] = handler;
            }
        }
    }
    // Create our controls
    return client.createControls({
        sceneID: 'default',
        controls: functions_1.Functions.makeControls(layout.layout.default),
    });
}).then(function (controls) {
    controls.forEach(function (control) {
        control.on('mousedown', function (inputEvent, participant) {
            var controlConfig = mapping[inputEvent.input.controlID];
            if (controlConfig != null) {
                if (handlers['button'] != null) {
                    handlers['button'].handle(control, inputEvent, participant, controlConfig);
                }
            }
            if (inputEvent.transactionID) {
                client.captureTransaction(inputEvent.transactionID)
                    .then(function () {
                    console.log("[SPRK] " + participant.username + ", " + control.cost);
                });
            }
        });
        control.on('mouseup', function (inputEvent, participant) {
            var controlConfig = mapping[inputEvent.input.controlID];
            if (controlConfig != null) {
                if (handlers['button'] != null) {
                    handlers['button'].handle(control, inputEvent, participant, controlConfig);
                }
            }
        });
    });
    client.ready(true)
        .then();
});
client.state.on('participantJoin', function (participant) {
    console.log("[JOIN] " + participant.username);
    participantList[participant.sessionID] = participant;
});
client.state.on('participantLeave', function (participantSessionID) {
    var participantName = participantList[participantSessionID].username;
    console.log("[PART] " + participantName);
});
/* tslint:enable:no-console */
