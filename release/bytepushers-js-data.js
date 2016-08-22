/**
 * Created by tonte on 8/16/16.
 */
/*global angular, BytePushers*/
/* jshint -W108, -W109 */
angular.module('software.bytepushers.data.provider', []);
angular.module('software.bytepushers.data.provider').provider('DataProvider', function () {
    "use strict";
    var daoConfig;

    this.$get = function () {
        if (!angular.isDefined(daoConfig)) {
            throw new BytePushers.dao.DaoException("No DAO Configuration definded.");
        }

        BytePushers.dao.DaoManager.getInstance().registerDao(daoConfig);

        return BytePushers.dao.DaoManager.getInstance();
    };

    this.setDaoConfig = function (jsonDaoConfig) {
        daoConfig = jsonDaoConfig;
    };

    this.getDaoConfig = function () {
        return daoConfig;
    };
});;/*global window, document, BytePushers*/
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
}(window, BytePushers));;/*global console, BytePushers*/
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

            target = (Object.isDefined(target)) ? target : {};
            source = (Object.isDefined(source)) ? source : {};

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
}(BytePushers));;/*global BytePushers*/
/* jshint -W108, -W109, unused:vars*/
/**
 * Created by tonte on 7/17/16.
 */
(function (BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    var Entity,
        isEntityIdValid,
        getEntityIdValidationMethod = function (daoConfig) {
            return (Object.isDefined(daoConfig) && Object.isDefined(daoConfig.entity) &&
                    Object.isFunction(daoConfig.entity.validationMethods.isValidEntityId)) ?
                    daoConfig.entityIdValidationMethod : function () { return true; };
        };

    BytePushers.dao.GenericDAO = function (daoConfig) {
        Entity = (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.Entity)) ? daoConfig.Entity : null;
        isEntityIdValid = getEntityIdValidationMethod(daoConfig);
    };

    BytePushers.dao.GenericDAO.prototype.isEntityIdValid = isEntityIdValid;

    /*jshint unused:true*/
    BytePushers.dao.GenericDAO.prototype.createEntity = function (entityConfig) {
        var entity;

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

}(BytePushers));;/* jshint -W108, -W109 */
/* exported reject, error */
/*global console, BytePushers*/
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
                    dataStore.getItems(items).then(function (existingEntityConfigs) {
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
                BytePushers.dao.LocalForageDao.find(criteria, limit).then(function (foundEntityConfigs) {
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
}(BytePushers, Promise)); /*, localforage*/;/**
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