export * from './lib/functions.js';
export * from './lib/handler/AbstractHandler';

if(!module.parent) {
	require('./bin/mixer-keyboard-cli');
}