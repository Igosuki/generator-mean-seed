/**
@todo
- once forminput, etc. are fixed on Angular 1.2.0, update bower.json to no longer be 1.2.0-rc.3
- remove the need to check this.optSubGenerators in EVERY function (i.e. find a way to NOT call this generator AT ALL if sub generator is wrong, but hookFor doesn't seem to be able to be conditionally called based on prompts..?)

@toc
1. askFor

NOTE: uses Yeoman this.spawnCommand call to run commands (since need to handle Windows/different operating systems and can't use 'exec' since that doesn't show (live) output)
*/

'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');

// var exec = require('child_process').exec;
// var spawn = require('child_process').spawn;

var PromptsMod =require('../common/prompts/prompts.js');
var CommandsMod =require('../common/commands/commands.js');

var CoreDefaultGenerator = module.exports = function CoreDefaultGenerator(args, options, config) {
	// By calling `NamedBase` here, we get the argument to the subgenerator call
	// as `this.name`.
	yeoman.generators.NamedBase.apply(this, arguments);

	//copy over prompt options to 'this' scope for templating
	var xx;
	for(xx in this.options.props) {
		this[xx] =this.options.props[xx];
		// console.log(xx+': '+this[xx]);
	}
};

util.inherits(CoreDefaultGenerator, yeoman.generators.NamedBase);

/**
@toc 1.
@method askFor
*/
CoreDefaultGenerator.prototype.askFor = function askFor() {
if(this.optSubGenerators.indexOf('core-default') >-1) {

	var prompts = PromptsMod.core();

	var skipKeys =['optAppKeywords'];
	var toInt =['optNpmInstall', 'optBowerInstall', 'optSeleniumInstall', 'optGruntQ', 'optUseGitSeparateBranch'];

	if(!this.optConfigFile) {		//only prompt if don't have config file
		var cb = this.async();

		this.prompt(prompts, function (props) {
			var newProps =PromptsMod.formProps(prompts, props, skipKeys, toInt, {});
			var xx;
			for(xx in newProps) {
				this.options.props[xx] =this[xx] =newProps[xx];
			}

			//handle some special ones (the skipKeys from above)
			this.options.props.optAppKeywords =this.optAppKeywords = props.optAppKeywords.split(' ');

			this.options.props.optCssPreprocessor =this.optCssPreprocessor ='less';

			cb();
		}.bind(this));
	}
	else {
		//still want to extend defaults
		var newProps =PromptsMod.formProps(prompts, this.options.props, skipKeys, toInt, {});
		var xx;
		for(xx in newProps) {
			this.options.props[xx] =this[xx] =newProps[xx];
		}

		//have to set this either way
		this.options.props.optCssPreprocessor =this.optCssPreprocessor ='less';
	}

}
};
