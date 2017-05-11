import {IButtonData, IControlData} from "beam-interactive-node2";
let fs = require('fs');
let path = require('path');

class Functions {
	static makeControls(controlsConfig: any): IControlData[] {
		const controls: IButtonData[] = [];
		for (let i = 0; i < controlsConfig.length; i++) {
			controls.push(controlsConfig[i]);
		}
		return controls;
	}
	
	static loadFile(path: string, name: string, relativePath: string = ''): any {
		path = relativePath + path;
		let json: JSON;
		if(fs.existsSync(path)) {
			json = require(path);
		} else {
			console.error(`Couldn't load ${name} file from provided path: ${path}`);
			process.exit(1);
		}
		return json;
	}
	
	static getHandler(handlerInfo: any, relativePath: string, role: string): any {
		function cb(fileName: string) {
			let tmp = require(fileName);
			return new tmp.Handler(handlerInfo.config);
		}
		
		if(handlerInfo == null) return null;
		
		let handlerFileName: string = '';
		if(path.extname(handlerInfo.path) == '') {
			handlerFileName = `${path.dirname(__filename)}/handler/${role}/${path.basename(handlerInfo.path)}.js`;
			if(fs.existsSync(handlerFileName)) {
				return cb(handlerFileName);
			}
		}

		handlerFileName = path.isAbsolute(handlerInfo.path) ? handlerInfo.path : (relativePath + '/' + handlerInfo.path);
		if(fs.existsSync(handlerFileName)) {
			return cb(handlerFileName);
		}
		
		handlerFileName = `${path.dirname(__filename)}/handler/${role}/default`;
		if(fs.existsSync(handlerFileName)) {
			return cb(handlerFileName);
		}

		return null;
	}
}

module.exports = Functions;