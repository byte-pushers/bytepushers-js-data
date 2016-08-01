/*global window, document, BytePushers*/
/* jshint -W108, -W109 */

/**
 * Created by tonte on 7/20/16.
 */
(function (window, BytePushers) {
    "use strict";
    if (window.BytePushers !== undefined && window.BytePushers !== null) {
        BytePushers = window.BytePushers;
    } else {
        window.BytePushers = {};
        BytePushers = window.BytePushers;
    }

    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");
    BytePushers.dao.DaoException = function (message) {
        //Error.call(this, message);
        BytePushers.dao.DaoException.prototype.superclass.apply(this, [message]);

        this.name = "BytePushers.dao.DaoException";
        this.message = message;
    };
    BytePushers.dao.DaoException.prototype = BytePushers.inherit(Error.prototype);
    BytePushers.dao.DaoException.prototype.constructor = BytePushers.dao.DaoException;
    BytePushers.dao.DaoException.prototype.superclass = Error;
    BytePushers.dao.DaoException.prototype.toString = function () {
        return this.name + "(" + this.message + ")";
    };
}(window, BytePushers));