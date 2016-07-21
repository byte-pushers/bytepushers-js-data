/**
 * Created by tonte on 7/19/16.
 */
(function(window, document, BytePushers) {
    var dataStore, Entity;

    BytePushers.adapter = BytePushers.namespace("software.bytepushers.data.persistence.adapter");


    BytePushers.adapter.BaseDaoAdapter = function (adapterConfig) {
        dataStore = (Object.isDefined(adapterConfig) && Object.isDefined(adapterConfig.dataStore))? adapterConfig.dataStore : null;
        Entity = (Object.isDefined(adapterConfig) && Object.isFunction(adapterConfig.Entity))? adapterConfig.Entity : null;
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.validateEntityId = function(entityValid) {
        throw new Error("abstract method");
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.getDataStore = function() {
        return dataStore;
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.createEntity = function(entityConfig) {
        return new Entity(entityConfig);
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.create = function(newEntity) {
        try {
            if(!Object.isDefined(newEntity)) {
                throw new BytePushers.exceptions.InvalidParameterException("Entity must be defined: " + newEntity);
            }
        } catch(error) {
            throw new BytePushers.adapter.DaoAdapterException(error);
        }

        return newEntity;
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.read = function(entityId) {
        try {
            if(validateEntityId(entityId)) {
                throw new BytePushers.exceptions.InvalidParameterException("Entity must be defined: " + entityId);
            }
        } catch(error) {
            throw new BytePushers.adapter.DaoAdapterException(error);
        }
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.update = function(existingEntity) {
        try {
            if(!Object.isDefined(existingEntity)) {
                throw new BytePushers.exceptions.InvalidParameterException("Entity must be defined: " + existingEntity);
            }
        } catch(error) {
            throw new BytePushers.adapter.DaoAdapterException(error);
        }
    };

    BytePushers.adapter.BaseDaoAdapter.prototype.delete = function(entityId) {
        try {
            if(validateEntityId(entityId)) {
                throw new BytePushers.exceptions.InvalidParameterException("Entity must be defined: " + entityId);
            }
        } catch(error) {
            throw new BytePushers.adapter.DaoAdapterException(error);
        }
    };

})(window, document, BytePushers);