/*global BytePushers, Promise*/
/* jshint -W108, -W109 */
/**
 * Created by tonte on 7/20/16.
 */
(function (BytePushers, Promise) {/*, localforage*/
    "use strict";

    var dataStore = null,
        validateEntityId = function (p) {
            if (!Object.isDefined(p.value)) {
                throw new BytePushers.exceptions.InvalidParameterException(p.description + ": must be defined: " + p.value);
            }
            if (this.isEntityIdValid(p.value)) {
                throw new BytePushers.exceptions.InvalidParameterException(p.description + ": must be defined: " + p.value);
            }
        },
        isParameterDefined = function (p) {
            if (!Object.isDefined(p.value)) {
                throw new BytePushers.exceptions.InvalidParameterException(p.description + ": must be defined: " + p.value);
            }
        },
        validateRequiredParameter = function (p, WrapperException, validationMethod) {
            try {
                validationMethod(p);
            } catch (exception) {
                if (Error.prototype.isPrototypeOf(WrapperException)) {
                    throw new WrapperException(exception);
                }
            }
        },
        createDataStore = function (daoConfig) {
            var localForageConfig;

            if (!Object.isDefined(daoConfig)) {
                throw new BytePushers.dao.DaoException("LocalForage Config must be defined.");
            }
            if (!Object.isDefined(daoConfig.name)) {
                throw new BytePushers.dao.DaoException("LocalForage Config: Data Store App Name must be defined.");
            }
            if (!Object.isDefined(daoConfig.version)) {
                throw new BytePushers.dao.DaoException("LocalForage Config: Data Store Version must be defined.");
            }
            if (!Object.isDefined(daoConfig.storeName)) {
                throw new BytePushers.dao.DaoException("LocalForage Config: Data Store Name must be defined.");
            }
            if (!Object.isDefined(daoConfig.dataStore)) {
                throw new BytePushers.dao.DaoException("LocalForage Config: Data Store must be defined.");
            }

            localForageConfig = {
                name        : daoConfig.name,
                version     : daoConfig.version,
                storeName   : daoConfig.storeName, // Should be alphanumeric, with underscores.
                description : daoConfig.description
            };

            if (Object.isDefined(daoConfig.driver)) {
                localForageConfig.driver = daoConfig.driver;
            }

            if (Object.isNumeric(daoConfig.size)) {
                localForageConfig.size = daoConfig.size;
            }

            /*if(localforage.config(localForageConfig)) {
                return localforage;
            } else {
                return null;
            }*/

            return daoConfig.dataStore.createInstance(localForageConfig);
        },
        generateNoSqlId = function (targetEntityReflection) {
            var noSqlId;

            if (Object.isDefined(targetEntityReflection)) {
                if (!Object.isDefined(targetEntityReflection.getId())) {
                    noSqlId = new Date().getTime();
                    targetEntityReflection.getMethod("setId")(noSqlId);
                } else {
                    noSqlId = targetEntityReflection.getId();
                }
            }

            return noSqlId;
        },
        ensureValidKey = function (key) {
            return key.toString();
        };

    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.LocalForageDao = function LocalForageDao(daoConfig) {
        BytePushers.dao.LocalForageDao.prototype.superclass.apply(this, [daoConfig]);
        dataStore = createDataStore(daoConfig);
    };
    BytePushers.dao.LocalForageDao.prototype = BytePushers.inherit(BytePushers.dao.GenericDAO.prototype);
    BytePushers.dao.LocalForageDao.prototype.constructor = BytePushers.dao.LocalForageDao;
    BytePushers.dao.LocalForageDao.prototype.superclass = BytePushers.dao.GenericDAO;

    BytePushers.dao.LocalForageDao.prototype.setDataStore = function (daoConfig) {
        dataStore = createDataStore(daoConfig);
    };

    BytePushers.dao.LocalForageDao.prototype.create = function (newEntity) {
        var dao = this,
            promise = new Promise(function (resolve, reject) {
                var targetEntityReflection;
                try {
                    if (!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(dao)) {
                        throw new BytePushers.dao.DaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
                    }
                    validateRequiredParameter({description: "Entity", value: newEntity}, BytePushers.dao.DaoException, isParameterDefined);
                } catch (error) {
                    reject(error);
                }

                targetEntityReflection = (new BytePushers.util.Reflection()).getInstance(newEntity.constructor, newEntity.toJSON());
                generateNoSqlId(targetEntityReflection);

                dataStore.setItem(ensureValidKey(targetEntityReflection.getId()),
                    (new newEntity.constructor(targetEntityReflection.toJSON())).toJSON()).then(function (newlyPersistedEntityStringConfig) {
                    return newlyPersistedEntityStringConfig;
                }).then(function (newlyPersistedEntityConfig) {
                    var newlyPersistedEntity = dao.createEntity(newlyPersistedEntityConfig);
                    resolve(newlyPersistedEntity);
                }).catch(function (error) {
                    reject(new BytePushers.dao.DaoException(error));
                });
            });

        return promise;

    };

    BytePushers.dao.LocalForageDao.prototype.read = function (entityId) {
        var dao = this,
            existingEntity,
            promise = new Promise(function (resolve, reject) {

                try {
                    if (!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(dao)) {
                        throw new BytePushers.dao.DaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
                    }
                    validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.dao.DaoException, isParameterDefined);
                    validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.dao.DaoException, validateEntityId);
                } catch (error) {
                    reject(error);
                }

                dataStore.getItem(ensureValidKey(entityId)).then(function (existingEntityConfig) {
                    if (existingEntityConfig) {
                        existingEntity = dao.createEntity(existingEntityConfig);
                    }

                    resolve(existingEntity);
                }).catch(function (error) {
                    reject(new BytePushers.dao.DaoException(error));
                });
            });

        return promise;
    };

    BytePushers.dao.LocalForageDao.prototype.update = function (updatedEntity) {
        var dao = this,
            promise = new Promise(function (resolve, reject) {
                try {
                    if (!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(dao)) {
                        throw new BytePushers.dao.DaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
                    }

                    validateRequiredParameter({description: "Entity", value: updatedEntity}, BytePushers.dao.DaoException, isParameterDefined);
                    validateRequiredParameter({description: "Entity ID", value: updatedEntity.getId()},
                        BytePushers.dao.DaoException, validateEntityId);
                } catch (error) {
                    reject(error);
                }

                dataStore.setItem(ensureValidKey(updatedEntity.getId()), updatedEntity.toJSON()).then(function (updatedEntityConfig) {
                    resolve(dao.createEntity(updatedEntityConfig));
                }).catch(function (error) {
                    reject(new BytePushers.dao.DaoException(error));
                });
            });

        return promise;
    };

    BytePushers.dao.LocalForageDao.prototype.delete = function (entityId) {
        var dao = this,
            promise = new Promise(function (resolve, reject) {
                try {
                    if (!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(dao)) {
                        throw new BytePushers.dao.DaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
                    }
                    validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.dao.DaoException, isParameterDefined);
                    validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.dao.DaoException, validateEntityId);
                } catch (error) {
                    reject(error);
                }

                dataStore.removeItem(ensureValidKey(entityId)).then(function () {
                    resolve(true);
                }).catch(function (error) {
                    reject(new BytePushers.dao.DaoException(error));
                });

            });

        return promise;
    };
}(BytePushers, Promise)); /*, localforage*/