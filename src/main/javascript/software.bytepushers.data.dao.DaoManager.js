/*global console, BytePushers*/
/* jshint -W108, -W109, -W054 */
/**
 * Created by tonte on 7/20/16.
 */
(function (BytePushers) {
    'use strict';
    var getConcreteDaoName = function (Dao, entityName) {
            var concreteDaoImplName;

            if (!Object.isConstructorFunction(Dao)) {
                throw new BytePushers.dao.DaoException("DAO Adapter(\n\n" + Dao.name + "\n\n) constructor method must be defined.");
            }

            if (!Object.isDefined(entityName)) {
                throw new BytePushers.dao.DaoException("Entity Name(\n\n" + entityName + "\n\n) must be defined.");
            }

            if (Object.isConstructorFunction(Dao)) {
                concreteDaoImplName = Dao.name.substringBefore("LocalForageDao");
                concreteDaoImplName = Dao.name.substringBefore("BaseDao");
                concreteDaoImplName = Dao.name.substringBefore("Dao");

                if (concreteDaoImplName.trim().length === 0) {
                    throw new BytePushers.dao.DaoException("DAO Adapter(" + Dao.name + ") constructor method must be prefixed" +
                        " with the name of the platform it implements.  For example, 'LocalForage' is the prefix in 'LocalForageBaseDaoAdapter'.");
                }
            }

            return entityName + concreteDaoImplName + "Dao";
        },
        getEntityName = function (Entity) {
            var entityName;

            if (Object.isConstructorFunction(Entity)) {
                entityName = Entity.name;
            } else {
                throw new BytePushers.dao.DaoException("Entity(" + Entity + ") constructor method must be defined.");
            }

            return entityName;
        };

    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.DaoManager = (function () {
        var instance, registeredDaoConstructors = {}, dataStoreConfig;

        function mergeConfigurations(target, source) {
            var property;

            for (property in source) {
                if (source.hasOwnProperty(property)) {
                    target[property] = source[property];
                }
            }
        }

        function getDao(daoName, entityConfig) {
            var dao = null;

            mergeConfigurations(dataStoreConfig, entityConfig);

            if (Object.isDefined(registeredDaoConstructors[daoName])) {
                if (typeof registeredDaoConstructors[daoName] === "object") {
                    dao = registeredDaoConstructors[daoName];
                }

                if (Object.isConstructorFunction(registeredDaoConstructors[daoName])) {
                    dao = new registeredDaoConstructors[daoName]();
                }
            }

            return dao;
        }

        function getEntityConstructor(daoConfig) {
            if (!Object.isDefined(daoConfig)) {
                throw new BytePushers.dao.DaoException("DAO Configuration must be defined.");
            }

            if (!Object.isConstructorFunction(daoConfig.Entity)) {
                throw new BytePushers.dao.DaoException("DAO Configuration must define an Entity.");
            }

            return daoConfig.Entity;
        }

        function getDaoConstructor(daoConfig) {
            if (!Object.isDefined(daoConfig)) {
                throw new BytePushers.dao.DaoException("DAO Configuration must be defined.");
            }

            if (!Object.isConstructorFunction(daoConfig.Dao)) {
                throw new BytePushers.dao.DaoException("DAO Configuration must define an DAO.");
            }

            return daoConfig.Dao;
        }

        function setAndGetDataStoreConfig(daoConfig) {
            dataStoreConfig = daoConfig;
            return dataStoreConfig;
        }

        /*jslint evil: true */
        function registerDao(daoConfig) {
            /* jshint ignore:start */
            var Entity = getEntityConstructor(daoConfig),
                Dao = getDaoConstructor(daoConfig),
                entityName = getEntityName(Entity),
                concreteDaoName = getConcreteDaoName(Dao, entityName),
                concreteDaoNameImpl = concreteDaoName + 'Impl',
                ConcreteDaoImplConstructor = new Function('daoConfig', 'return function ' + concreteDaoName + '() {' +
                    'this.__proto__.superclass.apply(this, [daoConfig]); ' + '}')(setAndGetDataStoreConfig(daoConfig));

            ConcreteDaoImplConstructor.prototype = BytePushers.inherit(BytePushers.dao.LocalForageDao.prototype);
            ConcreteDaoImplConstructor.prototype.constructor = ConcreteDaoImplConstructor;
            ConcreteDaoImplConstructor.prototype.superclass = BytePushers.dao.LocalForageDao;

            registeredDaoConstructors[concreteDaoName] = ConcreteDaoImplConstructor;
            registeredDaoConstructors[concreteDaoNameImpl] = null;
            /* jshint ignore:end */
        }
        /*jslint evil: false */

        return {
            getInstance: function () {
                if (instance === undefined) {
                    instance = {
                        getDao: getDao,
                        registerDao: registerDao
                    };
                }
                return instance;
            }
        };
    }());
}(BytePushers));