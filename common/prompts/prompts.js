/**
@fileOverview

@toc
1. formProps
*/

'use strict';

var self;
// var yoThis =false;		//will be used for calling yeoman commands like 'this.spawnCommand'

/**
@param {Object} opts
*/
function Prompts(opts) {
	self =this;
}

/**
Copy over and extend defaults for prompts
@toc 1.
@method formProps
@param {Array} prompts
@param {Object} props
@param {Array} skipKeys Keys to skip (NOT copy over)
	@example ['optAppKeywords']
@param {Array} toInt Keys to turn into integers (instead of strings)
	@example ['optNpmInstall', 'optBowerInstall', 'optSeleniumInstall', 'optGruntQ']
@param {Object} params
@return {Object} The new/final props - WITHOUT skip keys and in proper format, with defaults extended if applicable, etc.
*/
Prompts.prototype.formProps =function(prompts, props, skipKeys, toInt, params) {
	var newProps ={};

	var ii, jj, kk, skip, curName;
	for(ii =0; ii<prompts.length; ii++) {
		curName =prompts[ii].name;
		skip =false;
		for(jj =0; jj<skipKeys.length; jj++) {
			if(curName ==skipKeys[jj]) {
				skip =true;
				break;
			}
		}
		if(!skip) {		//copy over
			//extend default if necessary
			if(props[curName] ===undefined && prompts[ii].default !==undefined) {
				console.log('setting default for property: '+curName+': '+prompts[ii].default);
				props[curName] =prompts[ii].default;
			}

			//convert to integer (from string) if necessary
			for(kk =0; kk<toInt.length; kk++) {
				if(curName ==toInt[kk]) {
					props[curName] =parseInt(props[curName], 10);
				}
			}

			newProps[curName] =props[curName];
		}
	}

	return newProps;
};

Prompts.prototype.core = function () {
	return require('./core.json');
}

module.exports = new Prompts({});
