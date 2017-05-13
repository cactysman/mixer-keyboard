# Interactive2 Keyboard [![Beam](doc/beamM.png)](https://beam.pro/) [![NodeJS](doc/nodejs.png)](https://nodejs.org/) [![NPM version](https://img.shields.io/npm/v/beam-keyboard.svg)](https://www.npmjs.com/package/beam-keyboard)

A handy keyboard for [![Beam](doc/beamS.png)&nbsp;Beam&nbsp;interactive&nbsp;2](https://dev.beam.pro/reference/interactive/).  
This makes use of [interactive-node](https://github.com/WatchBeam/interactive-node).

## What it does
This script lets you set up a keyboard for your [Beam](https://beam.pro/) channel by defining a simple set of controls.
When viewers use your controls, keys that are defined in corresponding files will do whatever you want them to do, for instance control your content.

This is especially useful for interactive streams.

See it in action on [YouPlay](https://beam.pro/Youplay)!

## Installation
1. Globally install the [npm package](https://www.npmjs.com/package/beam-keyboard2).  
	```shell
	npm install -g beam-keyboard
	```
	
1. [Create a profile](#creating-a-profile)

1. Run the keyboard with your profile, like this
	```shell
	beam-keyboard "path/to/my/profiles/GreatGame/myprofile.json"
	```	

## Creating a profile
### Prerequisites
1. Enter the [![Interactive Studio logo](doc/interactiveStudio.png)&nbsp;*Interactive&nbsp;studio*](https://beam.pro/i/studio).
1. Create a new Project.
1. Give it a name and optionally fill out other fields.
1. Skip the *Build* section.
1. At *Code* grab your **version ID**. You will need that later on.  
	![Image of where you can obtain your version ID](doc/getVersionID.png)
	
### Setting up
1. Make sure you [installed the NPM package](#installation).

1. [Clone this repository](https://help.github.com/articles/cloning-a-repository/) or download it as a ``.zip`` file.
	
1. Copy the ``config_example`` directory to a place that makes sense  
	(You don't have to adopt the config directory structure here, but I think it's pretty organized the way it is)

1. Inside your own ``config`` directory edit ``auth.json`` and replace the dummy value with [your OAuth token](https://dev.beam.pro/reference/oauth/).  
	You will need following OAuth scope:
	-	``interactive:robot:self``

1. Check out how the [NES example](config_example/profiles/NES) works and copy the directory to your own ``config`` directory.
	1. Edit ``profile.json`` file and change values as you wish.
	1. For ``versionID`` enter the ``versionID`` you got [here](#prerequisites).
	1. Configure layouts and mappings as you wish.
	1. Create a [handler](#handlers) for your controls.

1. Do a test run!
	```shell
	beam-keyboard "./config/profiles/NES/profile.json" 
	```

## How things work
Currently the only program argument is a [JSON](https://www.w3schools.com/js/js_json_intro.asp) file containing the setup for your interactive profile.  
You can find an example for everything within the [config_example](config_example/profiles/NES/profile.json) directory. 

### Profile files
The profile file is the starting point for your interactive "profile" configuration.  
It's a [JSON](https://www.w3schools.com/js/js_json_intro.asp) file that holds paths to other [JSON](https://www.w3schools.com/js/js_json_intro.asp) files and some other stuff:
-	**auth** (String)  
	The path to your auth config file.
-	**handlers** (Object)  
	This defines the handlers that will be used for your controls.  
	Currently there is only *button*, but support for others (like for *joystick*) will follow.
		-	**path** (String)  
			That's the path to where the handler [NodeJS](https://nodejs.org/) file is located.  
			You can also pass a name of a default handler (e.g. ``robotjs``).
		-	**config**  
			The config your handler needs to get initialized.  
			Can be anything you want.
-	**layout** (String)  
	The path to your layout config file.
-	**mapping** (String)  
	The path to your mapping file.
-	**versionID** (String)  
	The *versionID* for your interactive project (see above).

### Layout files
The layout files consist of a [JSON](https://www.w3schools.com/js/js_json_intro.asp) object that holds following information:
-	~~**extends** (String)  
	This holds the path for a layout file this layout configuration should extend from.~~  
	**Available soon**.
	
-	**layout** (Object)  
	This holds the available scenes (only *default* is used right now) as key-value.  
	The name of the scene is the key.
		-	**&lt;sceneName&gt;** (Array)  
			(for example: '*default*')  
			This holds the configuration of the buttons in [JSON](https://www.w3schools.com/js/js_json_intro.asp) format.  
			You can design the layout and copy the [JSON](https://www.w3schools.com/js/js_json_intro.asp) configuration in the ![Interactive Studio logo](doc/interactiveStudio.png)&nbsp;[*Interactive studio*](https://beam.pro/i/studio).	

### Mapping files
The mapping files consist of a [JSON](https://www.w3schools.com/js/js_json_intro.asp) object that holds following information:
- **&lt;control identifier&gt;**
	This defines a configuration for each button that's passed to the matching handler.  
	<br/>
	**Example:**  
	If your handler creates files (for whatever reason) and writes content to them, this is what your config could look like:  
	```json
	{
		"a": {
			"file": "1.txt",
			"text": "boo"
		},
		"b": {
			"file": "2.txt",
			"text": "far"
		}
	}
	```

	If you just want to press buttons, you could also just pass strings. It's up to you here, really.

### Handlers
As of now, you just need to extend the ``AbstractHandler`` class and implement the ``handle`` method.  
See the [DefaultButtonHandler](src/lib/handler/button/default.ts) for an example of implementing it.


## Contributing
1. [Clone this repository](https://help.github.com/articles/cloning-a-repository/)

1. Edit the ``.ts`` source files in ``src``

1. Run the ``build`` command.  
	```shell
	npm run build
	```
	(Compiles the [TypeScript](https://www.typescriptlang.org/) code to [NodeJS](https://nodejs.org/) code)

1. Run a profile
	```shell
	node index.js "path/to/my/profiles/GreatGame/myprofile.json"
	```


## Todo
-	~~**Configuration of button actions**  
	So that you can also let buttons switch scenes for a user, have them update other buttons or scenes or let them do other stuff than just pressing a button.  
	This could involve interaction with some kind of [Socket](https://en.wikipedia.org/wiki/Network_socket) or starting a program.~~  
	**As of *v0.2.0*, we got handlers!**
-	**Ban list**  
	So that you can keep people from going wild on your buttons
-	**Moderator / team / role lists** (may become the same system as ban lists)  
	So that you can allow certain people to press certain buttons.	
-	**Layout extending**  
	So that for example the *SNES* layout can inherit the *NES* layout and just add L and R  
	(Halfway done, just needs proper backend logic)
-	**Actual support of multiple scenes**  
	Right now this only serves a default scene which is filled with generated buttons out of the config files.
-	**Visual feedback in the console**  
	Some gauges or graphs, so that you can see what happens.  
	Right now it's just some prefixes of messages.
-	**Visual feedback on buttons, cooldowns and keyboard interaction**  
	It looks like this isn't quite working with ``beam-interactive-node2`` yet.  
	I'll work on it as soon as it's supported.
