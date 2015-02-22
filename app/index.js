/**

@toc
1. hooks to call sub generators
2. askFor
3. askForConfig

*/

'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var fs = require('fs');

var pkgJson =require('../package.json');

var MeanSeedGenerator = module.exports = function MeanSeedGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	/**
	hooks to call sub generators - ORDER MATTERS! They'll be called in the order they are listed
	@toc 1.
	*/

	var hookFor = function(hookName) {
		this.hookFor(hookName, {
			args: ['name'],		//apparently this is required - get an error if don't have it - even though we don't use or need it..
			options: {
				options: this.options
			}
		});
	}
	hookFor.apply(this, 'mean-seed:core-default');
	hookFor.apply(this, 'mean-seed:core-scss');
	//order matters - this must be right after core generators first call (BEFORE add/write actual files)
	hookFor.apply(this, 'mean-seed:helper-core-commands-init');
	hookFor.apply(this, 'mean-seed:core-default-node');
	hookFor.apply(this, 'mean-seed:core-default-angular');
	hookFor.apply(this, 'mean-seed:core-scss-angular');
	hookFor.apply(this, 'mean-seed:ng-route');
	hookFor.apply(this, 'mean-seed:ng-directive');
	hookFor.apply(this, 'mean-seed:ng-service');
	hookFor.apply(this, 'mean-seed:node-controller');
	hookFor.apply(this, 'mean-seed:helper-core-merge');
	//NOTE: order matters - call this toward end / LAST!
	hookFor.apply(this, 'mean-seed:helper-commands');
	//NOTE: order matters - call this toward end / LAST!
	hookFor.apply(this, 'mean-seed:helper-log-next-steps');

	this.on('end', function () {
		// this.installDependencies({ skipInstall: options['skip-install'] });

		// this.log.writeln('Next steps:\n1. run `npm install && bower install`\n2. write your code then run `grunt`\n3. creat github repo\n4. commit & push `gh-pages` branch\n5. commit, tag, & push `master` branch\n6. (optional) register bower component');
	});

	// this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(MeanSeedGenerator, yeoman.generators.Base);

/**
@toc 2.
@method askFor
*/
MeanSeedGenerator.prototype.askFor = function askFor() {
	var cb = this.async();

	// have Yeoman greet the user.
	console.log(this.yeoman);

	var prompts = [
		{
			type: 'list',
			name: 'optSubGenerator',
			message: 'What subgenerator to use?',
			choices: [
				'core-default',
				'core-scss',
				'ng-route',
				'ng-directive',
				'ng-service',
				'node-controller'
			],
			default: 'core-default'
		}
	];

	this.prompt(prompts, function (props) {
		this.options.props ={};

		//use an array for subGenerators in case want to use more than one (i.e. for modularizing to multiple subgenerators)
		var generators =[props.optSubGenerator];
		var moreGenerators =false;
		var logNextStepsMsg =false;
		switch(props.optSubGenerator) {
			case 'core-default': {
				logNextStepsMsg ='Next steps:\n1. IF on Windows or you skipped the auto install, run `./node_modules/protractor/bin/webdriver-manager update`\n2. IF skipped any of the auto installs, run the install/build scripts - npm, bower, grunt (or re-run these if got any errors, i.e. `bower update && bower install` and/or `npm cache clean && npm install`)\n3. Run `node run.js`\n4. Open a browser to `http://localhost:3000` to view the app!\nSee the README.md file for more info.';
				moreGenerators =['helper-core-commands-init', 'core-default-node', 'core-default-angular', 'helper-core-merge', 'helper-commands', 'helper-log-next-steps'];
			}
			case 'core-scss': {
				logNextStepsMsg ='Next steps:\n1. IF on Windows or you skipped the auto install, run `./node_modules/protractor/bin/webdriver-manager update`\n2. IF skipped any of the auto installs, run the install/build scripts - npm, bower, grunt (or re-run these if got any errors, i.e. `bower update && bower install` and/or `npm cache clean && npm install`)\n3. Run `node run.js`\n4. Open a browser to `http://localhost:3000` to view the app!\nSee the README.md file for more info.';
				moreGenerators =['helper-core-commands-init', 'core-default-node', 'core-scss-angular', 'helper-core-merge', 'helper-commands', 'helper-log-next-steps'];
			}
			case 'ng-route': {
				logNextStepsMsg ='Next steps:\n1. IF you want to make a custom nav (header and/or footer) for this page, add it in `modules/services/nav/nav-config.js`\n2. Edit the files (html, js, less/scss) for your new page!';
				moreGenerators =['helper-commands', 'helper-log-next-steps'];
			}
			case 'ng-directive': {
				logNextStepsMsg ='Next steps:\n1. Edit the files (js, less/scss) for your new directive!';
				moreGenerators =['helper-commands', 'helper-log-next-steps'];
			}
			case 'ng-service': {
				logNextStepsMsg ='Next steps:\n1. Edit the files (js) for your new service!';
				moreGenerators =['helper-commands', 'helper-log-next-steps'];
			}

			case 'node-controller': {
				logNextStepsMsg ='Next steps:\n1. update `app/db_schema.json` to fill in your fields/schema for your new collection\n2. Open your new files in `app/modules/controllers/[yourNewController]` to replace/update all the `TODO` comments appropriately and edit/add anything else to finish your new API controller!';
				moreGenerators =['helper-log-next-steps'];
			}
		}
		if(moreGenerators) {
			generators =generators.concat(moreGenerators);
		}

		if(logNextStepsMsg) {
			this.options.props.optLogNextStepsMsg =this.optLogNextStepsMsg = logNextStepsMsg;
		}

		this.options.props.optSubGenerators =this.optSubGenerators = generators;

		cb();
	}.bind(this));
};

/**
@toc 3.
@method askForConfig
*/
MeanSeedGenerator.prototype.askForConfig = function askForConfig() {
this.options.props.optConfigFile =this.optConfigFile ='';		//default
if(this.optSubGenerators.indexOf('core-default') >-1 || this.optSubGenerators.indexOf('core-scss') >-1) {		//only use config for certain sub-generators
	var cb = this.async();

	var prompts = [
		{
			name: 'optConfigFile',
			message: 'What config file to use? (type "none" or any bad file path to use prompts here instead)',
			default: 'yo-configs/default.json'
		}
	];

	// console.log('dirname: '+__dirname);

	this.prompt(prompts, function (props) {
		var optConfigFile =this.options.props.optConfigFile =this.optConfigFile =props.optConfigFile;
		if(optConfigFile) {
			//parse config file into a json object
			// var configPath =path.join(__dirname, optConfigFile);
			var configPath =optConfigFile;
			if(!fs.existsSync(configPath)) {
				console.log('optConfigFile '+optConfigFile+' does not exist, using prompts here');
				this.options.props.optConfigFile =this.optConfigFile ='';		//set optConfigFile to blank to trigger prompts
			}
			else {
				var config = JSON.parse(this.readFileAsString(configPath));

				var xx;
				for(xx in config.prompts) {
					this[xx] =config.prompts[xx];
					this.options.props[xx] =config.prompts[xx];
					// console.log(xx+': '+this[xx]);
				}
			}
		}

		cb();
	}.bind(this));
}
};

/**
Read and set 'optPkgJson' variable to package.json file (i.e. for setting version number and name elsewhere)
@toc 4.
@method getPackageJson
*/
MeanSeedGenerator.prototype.getPackageJson = function getPackageJson() {
	// var pkgJson = JSON.parse(this.readFileAsString('package.json'));
	//pkgJson require'd at top of file

	var key ='optPkgJson';
	this.options.props[key] =this[key] =pkgJson;
};
