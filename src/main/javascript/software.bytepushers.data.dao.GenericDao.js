/*global BytePushers*/
/* jshint -W108, -W109, unused:vars*/
/**
 * Created by tonte on 7/17/16.
 */
(function (BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.GenericDAO = function (daoConfig) {
        var Entity = (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.Entity)) ? daoConfig.Entity : null,
            isEntityIdValid = getEntityIdValidationMethod(daoConfig);

        this.getEntity = function() {
            return Entity;
        };

        function getEntityIdValidationMethod (daoConfig) {
            return (Object.isDefined(daoConfig) && Object.isDefined(daoConfig.entity) &&
            Object.isFunction(daoConfig.entity.validationMethods.isValidEntityId)) ?
                daoConfig.entityIdValidationMethod : function () { return true; };
        }
    };

    BytePushers.dao.GenericDAO.prototype.isEntityIdValid = isEntityIdValid;

    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.createEntity = function (entityConfig) {
        var entity, Entity = this.getEntity();

        if (!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(this)) {
            throw new BytePushers.dao.DaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        entity = new Entity(entityConfig);
        return entity;
    };
    /*jshint unused:false*/
    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.create = function () {
        if (!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(this)) {
            throw new BytePushers.dao.DaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.DaoException("abstract method");
    };
    /*jshint unused:false*/
    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.read = function () {
        if (!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(this)) {
            throw new BytePushers.dao.DaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.DaoException("abstract method");
    };
    /*jshint unused:false*/
    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.update = function () {
        if (!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(this)) {
            throw new BytePushers.dao.DaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.DaoException("abstract method");
    };
    /*jshint unused:false*/
    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.delete = function () {
        if (!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(this)) {
            throw new BytePushers.dao.DaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.DaoException("abstract method");
    };
    /*jshint unused:false*/

}(BytePushers));