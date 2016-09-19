/**
 * Created by tonte on 8/16/16.
 */
/*global angular, localforage, BytePushers*/
/* jshint -W108, -W109 */
angular.module('software.bytepushers.data.provider', []);
angular.module('software.bytepushers.data.provider').provider('DataProvider', function () {
    "use strict";
    var dataProviderConfig;

    this.$get = function () {
        if (!angular.isDefined(dataProviderConfig)) {
            throw new BytePushers.dao.DaoException("No DAO Configuration defined.");
        }

        if (!angular.isArray(dataProviderConfig.entities)) {
            throw new BytePushers.dao.DaoException("No DAO Entity Configurations defined.");
        }

        if (angular.isArray(dataProviderConfig.entities) && dataProviderConfig.entities.length === 0) {
            throw new BytePushers.dao.DaoException("No DAO Entity Configurations defined.");
        }

        dataProviderConfig.entities.forEach(function (entityClassName) {
            BytePushers.dao.DaoManager.getInstance().registerDao({
                name        : 'pmms-mobile-app',
                version     : 1.0,
                storeName   : 'pmms-mobile-app-data-store', // Should be alphanumeric, with underscores.
                description : 'PMMS Mobile App Data Store',
                Entity      : entityClassName,
                Dao         : BytePushers.dao.LocalForageDao,
                dataStore   : localforage,
                entityConfigs: {
                    personEntityConfig: {
                        entityIdValidationMethod: function () {
                            return true;
                        }
                    }
                }
            });
        });

        return BytePushers.dao.DaoManager.getInstance();
    };

    this.setDataProviderConfig = function (jsonDaoConfig) {
        dataProviderConfig = jsonDaoConfig;
    };

    this.getDataProviderConfig = function () {
        return dataProviderConfig;
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


    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao || BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.DaoManager = (function () {
        var singleton,
            dataManager;

        function DataManager() {
            var dataStoreConfig,
                registeredDaoConstructors = [];

            function getConcreteDaoName(Dao, entityName) {
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
                            " with the name of the platform it implements.  For example, 'LocalForage' is the prefix in " +
                            "'LocalForageBaseDaoAdapter'.");
                    }
                }

                return entityName + concreteDaoImplName + "Dao";
            }

            function getEntityName(Entity) {
                var entityName;

                if (Object.isConstructorFunction(Entity)) {
                    entityName = Entity.name;
                } else {
                    throw new BytePushers.dao.DaoException("Entity(" + Entity + ") constructor method must be defined.");
                }

                return entityName;
            }

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
            this.registerDao = function (daoConfig) {
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
            };

            this.getDao = function (daoName, entityConfig) {
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
            };
        }

        dataManager = {
            getInstance: function (applicationConfig) {
                if (singleton === undefined) {
                    singleton = new DataManager(applicationConfig);
                }
                return singleton;
            }
        };

        return dataManager;
    }());
}(BytePushers));;/*global BytePushers*/
/* jshint -W108, -W109*/
/*exported isEntityIdValid */
/**
 * Created by tonte on 7/17/16.
 */
(function (BytePushers) {
    "use strict";
    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    function getEntityIdValidationMethod(daoConfig) {
        return (Object.isDefined(daoConfig) && Object.isDefined(daoConfig.entity) &&
        Object.isFunction(daoConfig.entity.validationMethods.isValidEntityId)) ?
                daoConfig.entityIdValidationMethod : function () { return true; };
    }

    BytePushers.dao.GenericDAO = function (daoConfig) {
        var Entity = (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.Entity)) ? daoConfig.Entity : null,
            isEntityIdValid = getEntityIdValidationMethod(daoConfig);

        this.getEntity = function () {
            return Entity;
        };

        this.isEntityIdValid = function () {
            isEntityIdValid();
        };
    };

    BytePushers.dao.GenericDAO.prototype.isEntityIdValid = function () {
        this.isEntityIdValid();
    };

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

}(BytePushers));;/* jshint -W108, -W109 */
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
}(window, BytePushers));;/**
 * Created by tonte on 8/23/16.
 */
/*global console, BytePushers*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.model = BytePushers.model || BytePushers.namespace("software.bytepushers.data.model");

    BytePushers.model.NoSqlId = function NoSqlId(noSqlIdJsonConfig) {
        var id = (Object.isDefined(noSqlIdJsonConfig) && Object.isNumeric(noSqlIdJsonConfig.id)) ? noSqlIdJsonConfig.id : null,
            demoMode = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.demoMode)) ? noSqlIdJsonConfig.demoMode : null,
            entityType = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.entityType)) ? noSqlIdJsonConfig.entityType : null,
            dataId = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.dataId)) ? noSqlIdJsonConfig.dataId : null,
            dataShopId =
                (Object.isDefined(noSqlIdJsonConfig) && Object.isNumeric(noSqlIdJsonConfig.dataShopId)) ? noSqlIdJsonConfig.dataShopId : null,
            dataLastModifiedTime =
                (Object.isDefined(noSqlIdJsonConfig) &&
                Object.isNumeric(noSqlIdJsonConfig.dataLastModifiedTime)) ? noSqlIdJsonConfig.dataLastModifiedTime : null;

        this.getId = function () {
            return id;
        };

        this.getDemoMode = function () {
            return demoMode;
        };

        this.getEntityType = function () {
            return entityType;
        };

        this.getDataId = function () {
            return dataId;
        };

        this.getShopId = function () {
            return dataShopId;
        };

        this.getDataLastModifiedTime = function () {
            return dataLastModifiedTime;
        };

        BytePushers.model.NoSqlId.prototype.toJSON = function (returnJsonAsString) {

            returnJsonAsString = Boolean(returnJsonAsString);

            var jsonId = (Object.isNumeric(this.getId())) ? this.getId() : null,
                jsonDemoMode = (Object.isString(this.getDemoMode())) ? "\"" + this.getDemoMode() + "\"" : null,
                jsonEntityType = (Object.isString(this.getEntityType())) ? "\"" + this.getEntityType() + "\"" : null,
                jsonDataId = (Object.isString(this.getDataId())) ? "\"" + this.getDataId() + "\"" : null,
                jsonDataShopId = (Object.isNumeric(this.getShopId())) ? this.getShopId() : null,
                jsonDataLastModifiedTime = (Object.isNumeric(this.getDataLastModifiedTime())) ? this.getDataLastModifiedTime() : null,
                json = "{" +
                    "\"id\": " + jsonId + "," +
                    "\"demoMode\": " + jsonDemoMode + "," +
                    "\"entityType\": " + jsonEntityType + "," +
                    "\"dataId\": " + jsonDataId + "," +
                    "\"dataShopId\": " + jsonDataShopId + "," +
                    "\"dataLastModifiedTime\": " + jsonDataLastModifiedTime +
                    "}";
            return returnJsonAsString ? json : JSON.parse(json);
        };

        BytePushers.model.NoSqlId.prototype.toString = function () {
            return "NoSqlId {" +
                "id=" + this.getId() + "," +
                "demoMode=" + this.getDemoMode() + "," +
                "entityType=" + this.getEntityType() + "," +
                "dataId=" + this.getDataId() + "," +
                "dataShopId=" + this.getShopId() + "," +
                "dataLastModifiedTime=" + this.getDataLastModifiedTime().toString() +
                "}";
        };

    };
}(BytePushers));
;/**
 * Created by tonte on 8/16/16.
 */
/*global console, BytePushers*/
/* jshint -W108, -W109, -W054*/
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.strategy = BytePushers.strategy ||  BytePushers.namespace("software.bytepushers.data.strategy");

    BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy = function DataSyncConflictResolutionClientWinsStrategy() {
        BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype.superclass.apply(this, []);

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype.synchronizeOnlineData =
            function (dirtyOfflineDataSearchCriteria, lastSynchronizedTime, someDao, dataSynchronizationService) {
                // Save work order queue to off-line data base.
                var promise = new Promise(function (resolve, reject) {

                    if (!Object.isDefined(dirtyOfflineDataSearchCriteria)) {
                        throw new BytePushers.exceptions.NullPointerException("dirtyOfflineDataSearchCriteria parameter must be defined.");
                    }

                    if (!Object.isDate(lastSynchronizedTime)) {
                        throw new BytePushers.exceptions.NullPointerException("lastSynchronizedTime parameter must be defined as a Date.");
                    }

                    if (!Object.isDefined(someDao)) {
                        throw new BytePushers.exceptions.NullPointerException("someDao parameter must be defined.");
                    }

                    if (!Object.isDefined(dataSynchronizationService)) {
                        throw new BytePushers.exceptions.NullPointerException("dataSynchronizationService parameter must be defined.");
                    }

                    dataSynchronizationService.getChanges(lastSynchronizedTime).then(function (conflictingPersistedObjects) {
                        return this.convertResultsToMap(conflictingPersistedObjects);
                    }).then(function (conflictingPersistedObjectMap) {
                        someDao.find(dirtyOfflineDataSearchCriteria).then(function (dirtyOfflineDataSearchCriteriaResultObjects) {
                            var conflictingPersistedObject;
                            dirtyOfflineDataSearchCriteriaResultObjects.forEach(function (dirtyOfflineDataDetachedObject) {
                                if (BytePushers.implementsInterface(dirtyOfflineDataDetachedObject, "getNoSqlId")) {

                                    conflictingPersistedObject = conflictingPersistedObjectMap.get(dirtyOfflineDataDetachedObject.getNoSqlId());

                                    if (Object.isDefined(conflictingPersistedObject)) {
                                        conflictingPersistedObjectMap.remove(conflictingPersistedObject.getNoSqlId());
                                    }
                                } else {
                                    console.log("Warning: " + dirtyOfflineDataDetachedObject + " does not implement getNoSqlId() method.");
                                }

                                dataSynchronizationService.save(dirtyOfflineDataDetachedObject);
                            });
                        });

                        return conflictingPersistedObjectMap;
                    }).then(function (newlyPersistedObjectMap) {
                        if (Object.isDefined(newlyPersistedObjectMap)) {
                            newlyPersistedObjectMap.toArray().forEach(function (newlyPersistedObject) {
                                someDao.create(newlyPersistedObject);
                                newlyPersistedObjectMap.remove(newlyPersistedObject.getNoSqlId());
                            });
                        }

                        resolve(true);
                    }).catch(function (error) {
                        reject(new BytePushers.dao.DataException(error));
                    });
                });

                return promise;
            };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype.synchronizeOfflineData =
            function () { /*dirtyOfflineDataSearchCriteria, lastSynchronizedTime, someDao*/
                // Nothing to synch since we are offline.  Just resolve promise and return promise with synchronized status set to true.
                var promise = new Promise(function (resolve) {/*, reject*/
                    resolve(true);
                });
                return promise;
            };
        /*jshint unused:false*/
    };
    BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype =
        BytePushers.inherit(BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype);
    BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype.constructor =
        BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy;
    BytePushers.strategy.DataSyncConflictResolutionClientWinsStrategy.prototype.superclass =
        BytePushers.strategy.DataSyncConflictResolutionStrategy;
}(BytePushers));;/**
 * Created by tonte on 8/16/16.
 */
/*global console, BytePushers, Map*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.strategy = BytePushers.strategy || BytePushers.namespace("software.bytepushers.data.strategy");

    BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy = function DataSyncConflictResolutionServerWinsStrategy() {
        BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype.superclass.apply(this, []);

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype.synchronizeOnlineData =
            function (searchCriteria, lastSynchronizedTime, daoManager, dataSynchronizationService) {
                //Save work order queue to off-line data base.
                var detachedSearchCriteriaResultMap = new Map(),
                    promise = new Promise(function (resolve, reject) {

                        if (!Object.isDefined(searchCriteria)) {
                            throw new BytePushers.exceptions.NullPointerException("searchCriteria parameter must be defined.");
                        }

                        if (!Object.isDate(lastSynchronizedTime)) {
                            throw new BytePushers.exceptions.NullPointerException("lastSynchronizedTime parameter must be defined as a Date.");
                        }

                        if (!Object.isDefined(daoManager)) {
                            throw new BytePushers.exceptions.NullPointerException("daoManager parameter must be defined.");
                        }

                        if (!Object.isDefined(dataSynchronizationService)) {
                            throw new BytePushers.exceptions.NullPointerException("dataSynchronizationService parameter must be defined.");
                        }

                        daoManager.find(searchCriteria).then(function (searchCriteriaDetachedObjects) {
                            var detachedSearchCriteriaResultMapPopulated = false;
                            searchCriteriaDetachedObjects.forEach(function (searchCriteriaDetachedObject) {
                                if (BytePushers.implementsInterface(searchCriteriaDetachedObject, "getNoSqlId")) {
                                    detachedSearchCriteriaResultMap.set(searchCriteriaDetachedObject.getNoSqlId(), searchCriteriaDetachedObject);
                                    detachedSearchCriteriaResultMapPopulated = true;
                                } else {
                                    console.log("Warning: " + searchCriteriaDetachedObject + " does not implement getNoSqlId() method.");
                                }
                            });

                            return detachedSearchCriteriaResultMapPopulated;
                        }).then(function () { /*detachedSearchCriteriaResultMapPopulated*/
                            return dataSynchronizationService.getChanges(lastSynchronizedTime);
                        }).then(function (conflictingPersistedObjects) {
                            var conflictingDetachedObject;

                            conflictingPersistedObjects.forEach(function (conflictingPersistedObject, conflictingPersistedObjectIndex) {
                                if (Object.isDefined(conflictingPersistedObject)) {
                                    conflictingDetachedObject = detachedSearchCriteriaResultMap.get(conflictingPersistedObject.getNoSqlId());

                                    if (Object.isDefined(conflictingDetachedObject)) {
                                        conflictingPersistedObjects.splice(conflictingPersistedObjectIndex, 1);
                                        daoManager.update(conflictingPersistedObject);
                                    } else {
                                        daoManager.create(conflictingPersistedObject);
                                    }
                                }
                            });

                            resolve(true);
                        }).catch(function (error) {
                            reject(new BytePushers.dao.DataException(error));
                        });
                    });

                return promise;
            };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype.synchronizeOfflineData =
            function () { /*searchCriteria, lastSynchronizedTime, daoManager, dataSynchronizationService*/
                //Get work order queue from off-line data base.
                var promise = new Promise(function (resolve) { /*reject*/
                    resolve(true);
                });

                return promise;
            };
        /*jshint unused:false*/
    };
    BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype =
        BytePushers.inherit(BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype);
    BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype.constructor =
        BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy;
    BytePushers.strategy.DataSyncConflictResolutionServerWinsStrategy.prototype.superclass =
        BytePushers.strategy.DataSyncConflictResolutionStrategy;
}(BytePushers));
;/**
 * Created by tonte on 8/16/16.
 */
/*global console, BytePushers, Map*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.strategy = BytePushers.strategy || BytePushers.namespace("software.bytepushers.data.strategy");

    BytePushers.strategy.DataSyncConflictResolutionStrategy = function DataSyncConflictResolutionStrategy() {
        this.synchronizeData = function (findDirtyOfflineDataSearchCriteria, lastSynchronizedTime, onlineStatus,
                                         someDao, dataSynchronizationService) {
            var synchronizeDataPromise;
            onlineStatus = Boolean(onlineStatus);
            if (!BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
            }

            if (onlineStatus) {
                synchronizeDataPromise = this.synchronizeOnlineData(findDirtyOfflineDataSearchCriteria, lastSynchronizedTime,
                    someDao, dataSynchronizationService);
            } else {
                synchronizeDataPromise = this.synchronizeOfflineData(findDirtyOfflineDataSearchCriteria, lastSynchronizedTime, someDao);
            }

            return synchronizeDataPromise;
        };

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.synchronizeOnlineData =
            function () { /*searchCriteria, lastSynchronizedTime, someDao, dataSynchronizationService*/
                //Save work order queue to off-line data base.
                if (!BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                    throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
                }

                throw new BytePushers.data.DataException("abstract method");
            };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.synchronizeOfflineData =
            function () {/*searchCriteria, lastSynchronizedTime, someDao*/
                //Get work order queue from off-line data base.
                if (!BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                    throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
                }

                throw new BytePushers.data.DataException("abstract method");
            };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.DataSyncConflictResolutionStrategy.prototype.convertResultsToMap = function (objects) {
            var objectMap = new Map();

            if (Object.isArray(objects)) {
                objects.forEach(function (object) {
                    if (BytePushers.implementsInterface(object, "getNoSqlId")) {
                        if (Object.isDefined(object)) {
                            objectMap.set(object.getNoSqlId(), object);
                        }
                    } else {
                        console.log("Warning: " + object + " does not implement getNoSqlId() method.");
                    }
                });
            }

            return objectMap;
        };
        /*jshint unused:false*/
    };
}(BytePushers));