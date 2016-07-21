/**
 * Created by tonte on 7/20/16.
 */
define(['bytepushers'], function(BytePushers) {
    var dataStore;

    var validateEntityId = function(p) {
        if(this.isEntityIdValid(p.value)) {
            throw new BytePushers.exceptions.InvalidParameterException(p.description + ": must be defined: " + p.value);
        }
    };

    var isParameterDefined = function(p) {
        if(!Object.isDefined(p.value)) {
            throw new BytePushers.exceptions.InvalidParameterException(p.description + ": must be defined: " + p.value);
        }
    };

    var validateRequiredParameter = function(p, WrapperException, validationMethod) {
        try{
            validationMethod(p);
        } catch(exception) {
            if(Error.prototype.isPrototypeOf(WrapperException)) {
                throw new WrapperException(exception);
            }
        }
    };

    BytePushers.dao = BytePushers || BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.LocalForageDao = function LocalForageDao(daoConfig) {
        BytePushers.dao.LocalForageDao.prototype.superclass.apply(this, [daoConfig]);
        dataStore = (Object.isDefined(daoConfig) && Object.isDefined(daoConfig.dataStore))? daoConfig.dataStore : null;
    };

    BytePushers.dao.LocalForageDao.prototype.setDataStore = function(dataStoreConnection) {
        BytePushers.dao.LocalForageDao.prototype.superclass.prototype.create.apply(this, [dataStoreConnection]);
    };

    BytePushers.dao.LocalForageDao.prototype.create = function(newEntity) {
        var promise;

        if(!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var newlyPersistedEntity,
                dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity", value: newEntity}, BytePushers.adapter.DaoAdapterException, isParameterDefined);

            dataStore.setItem(newEntity.getNextId(), newEntity).then(function () {
                return dataStore.getItem(newEntity.getId());
            }).then(function (newlyPersistedEntityConfig) {
                newlyPersistedEntity = this.createEntity(newlyPersistedEntityConfig);
                resolve(newlyPersistedEntity);
            }).catch(function (error) {
                reject(new BytePushers.dao.DaoAdapterException(error));
            });

        });

        return promise;

    };

    BytePushers.dao.LocalForageDao.prototype.read = function(entityId) {
        var promise;

        if(!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var existingEnity,
                dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, isParameterDefined);
            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, validateEntityId);

            dataStore.getItem(newEntity.getId()).then(function(existingEntityConfig){
                existingEnity = this.createEntity(existingEntityConfig);
                resolve(existingEnity);
            }).catch(function(error) {
                reject(new BytePushers.dao.DaoAdapterException(error));
            })
        });

        return promise;
    };

    BytePushers.dao.LocalForageDao.prototype.update = function(updatedEntity) {
        var promise;

        if(!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity", value: updatedEntity}, BytePushers.adapter.DaoAdapterException, isParameterDefined);
            validateRequiredParameter({description: "Entity ID", value: updatedEntity.getId()}, BytePushers.adapter.DaoAdapterException, validateEntityId);

            dataStore.setItem(updatedEntity.getId(), updatedEntity).then(function (updatedEntityConfig) {
                resolve(updatedEntity);
            }).catch(function (error) {
                reject(new BytePushers.dao.DaoAdapterException(error));
            });
        });

        return promise;

    };

    BytePushers.dao.LocalForageDao.prototype.delete = function(entityId) {
        var promise;

        if(!BytePushers.dao.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, isParameterDefined);
            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, validateEntityId);

            dataStore.removeItem(entityId).then(function () {
                resolve();
            }).catch(function (error) {
                reject(new BytePushers.dao.DaoAdapterException(error));
            });

        });

        return promise;
    };

    PMMS.dao.LocalForageDao.prototype = BytePushers.inherit(BytePushers.dao.GenericDAO.prototype);
    PMMS.dao.LocalForageDao.prototype.constructor = PMMS.dao.LocalForageDao;
    PMMS.dao.LocalForageDao.prototype.superclass = BytePushers.dao.GenericDAO;

});
