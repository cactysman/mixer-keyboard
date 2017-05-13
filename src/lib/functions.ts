import {GameClient, IButtonData, IControlData} from "beam-interactive-node2";
import {AbstractHandler} from "./handler/AbstractHandler";
let fs = require('fs');
let path = require('path');

export class Functions {
	static client: GameClient;

	static setClient(client: GameClient) {
		Functions.client = client;
	}

	static makeControls(controlsConfig: any): IControlData[] {
		const controls: IButtonData[] = [];
		for (let i = 0; i < controlsConfig.length; i++) {
			controls.push(controlsConfig[i]);
		}
		return controls;
	}

	static loadFile(filepath: string, name: string, relativePath: string = ''): any {
		if(!path.isAbsolute(filepath)) {
			filepath = path.join(relativePath, filepath);
		}
		filepath = path.normalize(filepath);
		
		let json: JSON;
		if(fs.existsSync(filepath)) {
			json = JSON.parse(fs.readFileSync(filepath));
		} else {
			console.error(`Couldn't load ${name} file from provided path: ${filepath}`);
			process.exit(1);
		}
		return json;
	}

	static getHandler(handlerInfo: any, relativePath: string, role: string): AbstractHandler {
		function cb(fileName: string): AbstractHandler {
			let handlerFile = require(path.normalize(fileName));
			
			let object = null;
			if(handlerFile.Handler != null) {
				object = new handlerFile.Handler(Functions.client, handlerInfo.config);
				if(Object.getPrototypeOf(object.constructor.prototype).constructor == AbstractHandler) {
					return object;
				}
			}
			return object;
		}
		
		if(handlerInfo == null) return null;
		
		let handlerFileName: string = '';
		if(path.extname(handlerInfo.path) == '') {
			handlerFileName = path.join(path.dirname(__filename), 'handler', role, handlerInfo.path + '.js');
			if(fs.existsSync(handlerFileName)) {
				return cb(handlerFileName);
			}
		}

		handlerFileName = path.isAbsolute(handlerInfo.path) ? handlerInfo.path : path.join(relativePath, handlerInfo.path);
		if(fs.existsSync(handlerFileName)) {
			return cb(handlerFileName);
		}
		
		handlerFileName = path.join(path.dirname(__filename), 'handler', role, 'default');
		if(fs.existsSync(handlerFileName)) {
			return cb(handlerFileName);
		}
		return null;
	}
}

exports.Functions = Functions;