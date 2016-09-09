/* jshint -W108, -W109 */
/* exported reject, error */
/*global console, BytePushers, localforageFind*/
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
            var localForageConfig,
                decoratedDataStore;

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

            decoratedDataStore = daoConfig.dataStore.createInstance(localForageConfig);
            localforageFind(decoratedDataStore);
            return decoratedDataStore;
        },
        someRandomNumber = function (max) {
            return Math.floor((Math.random() * max) + 1);
        },
        generateNoSqlId = function (targetEntityReflection) {
            var noSqlId;

            if (Object.isDefined(targetEntityReflection)) {
                if (BytePushers.implementsInterface(targetEntityReflection, "getNoSqlId")) {
                    noSqlId = targetEntityReflection.getNoSqlId();
                } else {
                    if (!Object.isDefined(targetEntityReflection.getId())) {
                        noSqlId = new Date().getTime() + someRandomNumber(9999999);
                        targetEntityReflection.getMethod("setId")(noSqlId);
                    } else {
                        noSqlId = targetEntityReflection.getId();
                    }
                }
            }

            return noSqlId;
        },
        getNoSqlId = function (targetEntity) {
            var noSqlId, msg;

            if (BytePushers.implementsInterface(targetEntity, "getNoSqlId")) {
                noSqlId = targetEntity.getNoSqlId();
            } else {
                if (Object.isDefined(targetEntity.getId())) {
                    noSqlId = targetEntity.getId();
                } else {
                    msg = "Could not get NoSQLId because targetEntity does not implement getNoSqlId() method and getId() " +
                          "method returns null or undefined";
                    throw new BytePushers.dao.DaoException(msg);
                }
            }


            return noSqlId;
        },
        ensureValidKey = function (key) {
            return (typeof key === "string" || key instanceof String || typeof key === "number" || key instanceof Number) ?
                    key.toString() : JSON.stringify(key.toJSON());
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

                dataStore.setItem(ensureValidKey(getNoSqlId(targetEntityReflection)),
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

    BytePushers.dao.LocalForageDao.prototype.getItems = function (keys) {
        var dao = this,
            existingEntities = [],
            promise = new Promise(function (resolve, reject) {

                keys = (Object.isArray(keys)) ? keys : [];

                if (keys.length > 0) {
                    dataStore.getItems(keys).then(function (existingEntityConfigs) {
                        if (Object.isArray(existingEntityConfigs)) {
                            existingEntityConfigs.forEach(function (existingEntityConfig) {
                                existingEntities.push(dao.createEntity(existingEntityConfig));
                            });
                        }

                        resolve(existingEntities);
                    }).catch(function (error) {
                        reject(new BytePushers.dao.DaoException(error));
                    });
                } else {
                    resolve(existingEntities);
                }
            });

        return promise;
    };

    BytePushers.dao.LocalForageDao.prototype.setItems = function (items) {
        var dao = this,
            existingEntities = [],
            promise = new Promise(function (resolve, reject) {

                items = (Object.isArray(items)) ? items : [];

                if (items.length > 0) {
                    items.forEach(function (item) {
                        item.key = ensureValidKey(item.key);
                        item.value = item.value.toJSON();
                    });
                    dataStore.setItems(items).then(function (existingEntityConfigs) {
                        if (Object.isArray(existingEntityConfigs)) {
                            existingEntityConfigs.forEach(function (existingEntityConfig) {
                                existingEntities.push(dao.createEntity(existingEntityConfig));
                            });
                        }

                        resolve(existingEntities);
                    }).catch(function (error) {
                        reject(new BytePushers.dao.DaoException(error));
                    });
                } else {
                    resolve(existingEntities);
                }
            });

        return promise;
    };

    /*jshint unused:true*/
    /*jslint unparam: true*/
    BytePushers.dao.LocalForageDao.prototype.findById = function (entityId) {
        var promise = new Promise(function (resolve, reject) {
                //jshint unused:false
                BytePushers.dao.LocalForageDao.read(entityId).then(function (foundEntity) {
                    resolve(foundEntity);
                }).catch(function (error) {
                    resolve(null);
                });
            });

        return promise;
    };
    /*jslint unparam: false*/
    /*jshint unused:false*/

    /*jshint unused:true*/
    /*jslint unparam: true*/
    BytePushers.dao.LocalForageDao.prototype.find = function (criteria, limit) {
        var dao = this,
            foundEntities = [],
            promise = new Promise(function (resolve, reject) {
                //jshint unused:false
                dataStore.find(criteria, limit).then(function (foundEntityConfigs) {
                    foundEntityConfigs.forEach(function (foundEntityConfig) {
                        foundEntities.push(dao.createEntity(foundEntityConfig));
                    });
                    resolve(foundEntities);
                }).catch(function (error) {
                    resolve(foundEntities);
                });
            });

        return promise;
    };
    /*jslint unparam: false*/
    /*jshint unused:false*/

    /*jshint unused:true*/
    BytePushers.dao.LocalForageDao.prototype.update = function (updatedEntity) {
        var targetEntityReflection,
            dao = this,
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

                targetEntityReflection = (new BytePushers.util.Reflection()).getInstance(updatedEntity.constructor, updatedEntity.toJSON());
                generateNoSqlId(targetEntityReflection);

                dataStore.setItem(ensureValidKey(getNoSqlId(targetEntityReflection)), targetEntityReflection.toJSON())
                    .then(function (updatedEntityConfig) {
                        resolve(dao.createEntity(updatedEntityConfig));
                    }).catch(function (error) {
                        reject(new BytePushers.dao.DaoException(error));
                    });
            });

        return promise;
    };
    /*jshint unused:false*/

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