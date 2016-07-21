/**
 * Created by tonte on 7/19/16.
 */
(function (window, document, BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.adapter = BytePushers.adapter ||  BytePushers.namespace("software.bytepushers.data.persistence.adapter");
    BytePushers.adapter.DaoAdapterException = function (message) {
        //Error.call(this, message);
        BytePushers.adapter.DaoAdapterException.prototype.superclass.apply(this, [message]);

        this.name = "BytePushers.adapter.DaoAdapterException";
        this.message = message;
    };
    BytePushers.adapter.DaoAdapterException.prototype = BytePushers.inherit(Error.prototype);
    BytePushers.adapter.DaoAdapterException.prototype.constructor = BytePushers.adapter.DaoAdapterException;
    BytePushers.adapter.DaoAdapterException.prototype.superclass = Error;
    BytePushers.adapter.DaoAdapterException.prototype.toString = function () {
        return this.name + "(" + this.message + ")";
    };
}(window, document, BytePushers));