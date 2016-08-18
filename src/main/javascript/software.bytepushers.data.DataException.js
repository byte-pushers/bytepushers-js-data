/**
 * Created by tonte on 8/16/16.
 */
/*global window, document, BytePushers*/
/* jshint -W108, -W109 */
(function (window, BytePushers) {
    "use strict";
    if (window.BytePushers !== undefined && window.BytePushers !== null) {
        BytePushers = window.BytePushers;
    } else {
        window.BytePushers = {};
        BytePushers = window.BytePushers;
    }

    BytePushers.data = BytePushers.data ||  BytePushers.namespace("software.bytepushers.data.data");
    BytePushers.data.DataException = function (message) {
        //Error.call(this, message);
        BytePushers.data.DataException.prototype.superclass.apply(this, [message]);

        this.name = "BytePushers.data.DataException";
        this.message = message;
    };
    BytePushers.data.DataException.prototype = BytePushers.inherit(Error.prototype);
    BytePushers.data.DataException.prototype.constructor = BytePushers.data.DataException;
    BytePushers.data.DataException.prototype.superclass = Error;
    BytePushers.data.DataException.prototype.toString = function () {
        return this.name + "(" + this.message + ")";
    };
}(window, BytePushers));