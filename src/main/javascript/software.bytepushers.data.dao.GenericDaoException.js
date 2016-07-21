/**
 * Created by tonte on 7/20/16.
 */
(function (window, document, BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.persistence = BytePushers.persistence ||  BytePushers.namespace("software.bytepushers.data.persistence");
    BytePushers.persistence.GenericDaoException = function (message) {
        //Error.call(this, message);
        BytePushers.persistence.GenericDaoException.prototype.superclass.apply(this, [message]);

        this.name = "BytePushers.persistence.GenericDaoException";
        this.message = message;
    };
    BytePushers.persistence.GenericDaoException.prototype = BytePushers.inherit(Error.prototype);
    BytePushers.persistence.GenericDaoException.prototype.constructor = BytePushers.persistence.GenericDaoException;
    BytePushers.persistence.GenericDaoException.prototype.superclass = Error;
    BytePushers.persistence.GenericDaoException.prototype.toString = function () {
        return this.name + "(" + this.message + ")";
    };
}(window, document, BytePushers));