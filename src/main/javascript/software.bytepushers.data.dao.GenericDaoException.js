/**
 * Created by tonte on 7/20/16.
 */
(function (window, document, BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");
    BytePushers.dao.GenericDaoException = function (message) {
        //Error.call(this, message);
        BytePushers.dao.GenericDaoException.prototype.superclass.apply(this, [message]);

        this.name = "BytePushers.dao.GenericDaoException";
        this.message = message;
    };
    BytePushers.dao.GenericDaoException.prototype = BytePushers.inherit(Error.prototype);
    BytePushers.dao.GenericDaoException.prototype.constructor = BytePushers.dao.GenericDaoException;
    BytePushers.dao.GenericDaoException.prototype.superclass = Error;
    BytePushers.dao.GenericDaoException.prototype.toString = function () {
        return this.name + "(" + this.message + ")";
    };
}(window, document, BytePushers));