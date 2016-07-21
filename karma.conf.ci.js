/**
 * Created by Tonté Pouncil on 3/21/15.
 */
var baseConfig = require('./karma.conf.js');

module.exports = function(config){
    // Load base config
    baseConfig(config);

    // Override base config
    config.set({
        singleRun: true,
        autoWatch: false,
        browsers: ['PhantomJS']
    });
};