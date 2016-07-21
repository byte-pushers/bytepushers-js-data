/**
 * Created by tonte on 7/20/16.
 */
(function(window, document, BytePushers) {
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

    BytePushers.persistence = BytePushers.namespace("software.bytepushers.data.persistence");

    BytePushers.persistence.LocalForageDao = function LocalForageDao(daoConfig) {
        BytePushers.persistence.LocalForageDao.prototype.superclass.apply(this, [daoConfig]);
        dataStore = (Object.isDefined(daoConfig) && Object.isDefined(daoConfig.dataStore))? daoConfig.dataStore : null;
    };

    BytePushers.persistence.LocalForageDao.prototype.setDataStore = function(dataStoreConnection) {
        BytePushers.persistence.LocalForageDao.prototype.superclass.prototype.create.apply(this, [dataStoreConnection]);
    };

    BytePushers.persistence.LocalForageDao.prototype.create = function(newEntity) {
        var promise;

        if(!BytePushers.persistence.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
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
                reject(new BytePushers.persistence.DaoAdapterException(error));
            });

        });

        return promise;

    };

    BytePushers.persistence.LocalForageDao.prototype.read = function(entityId) {
        var promise;

        if(!BytePushers.persistence.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
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
                reject(new BytePushers.persistence.DaoAdapterException(error));
            })
        });

        return promise;
    };

    BytePushers.persistence.LocalForageDao.prototype.update = function(updatedEntity) {
        var promise;

        if(!BytePushers.persistence.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity", value: updatedEntity}, BytePushers.adapter.DaoAdapterException, isParameterDefined);
            validateRequiredParameter({description: "Entity ID", value: updatedEntity.getId()}, BytePushers.adapter.DaoAdapterException, validateEntityId);

            dataStore.setItem(updatedEntity.getId(), updatedEntity).then(function (updatedEntityConfig) {
                resolve(updatedEntity);
            }).catch(function (error) {
                reject(new BytePushers.persistence.DaoAdapterException(error));
            });
        });

        return promise;

    };

    BytePushers.persistence.LocalForageDao.prototype.delete = function(entityId) {
        var promise;

        if(!BytePushers.persistence.LocalForageDao.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in LocalForageDao Object's hierarchy prototype chain.");
        }

        promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, isParameterDefined);
            validateRequiredParameter({description: "Entity ID", value: entityId}, BytePushers.adapter.DaoAdapterException, validateEntityId);

            dataStore.removeItem(entityId).then(function () {
                resolve();
            }).catch(function (error) {
                reject(new BytePushers.persistence.DaoAdapterException(error));
            });

        });

        return promise;
    };

    PMMS.persistence.LocalForageDao.prototype = BytePushers.inherit(BytePushers.persistence.GenericDAO.prototype);
    PMMS.persistence.LocalForageDao.prototype.constructor = PMMS.persistence.LocalForageDao;
    PMMS.persistence.LocalForageDao.prototype.superclass = BytePushers.persistence.GenericDAO;

})(window, document, BytePushers);