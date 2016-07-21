/**
 * Created by tonte on 7/19/16.
 */
(function(window, document, BytePushers) {

    BytePushers.adapter = BytePushers.namespace("software.bytepushers.data.persistence.adapter");


    BytePushers.adapter.LocalForageBaseDaoAdapter = function LocalForageBaseDaoAdapter(LocalForageAdapterConfig) {
        BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.apply(this, [LocalForageAdapterConfig]);
    };

    BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.setDataStore = function(dataStoreConnection) {
        BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.prototype.create.apply(this, [dataStoreConnection]);
    };

    BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.create = function(newEntity) {
        var promise = new Promise(function(resolve, reject){
            var newlyPersistedEntity,
                dataStore = this.getDataStore();

            BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.prototype.create.apply(this, [newEntity]);

            dataStore.setItem(newEntity.getNextId(), newEntity).then(function () {
                return dataStore.getItem(newEntity.getId());
            }).then(function (newlyPersistedEntityConfig) {
                newlyPersistedEntity = this.createEntity(newlyPersistedEntityConfig);
                resolve(newlyPersistedEntity);
            }).catch(function (error) {
                reject(new BytePushers.adapter.DaoAdapterException(error));
            });

        });

        return promise;

    };

    BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.read = function(entityId) {
        var promise = new Promise(function(resolve, reject) {
            var existingEnity,
                dataStore = this.getDataStore();

            BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.prototype.read.apply(this, [entityId]);

            dataStore.getItem(newEntity.getId()).then(function(existingEntityConfig){
                existingEnity = this.createEntity(existingEntityConfig);
                resolve(existingEnity);
            }).catch(function(error) {
                reject(new BytePushers.adapter.DaoAdapterException(error));
            })
        });

        return promise;
    };

    BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.update = function(updatedEntity) {
        var promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.prototype.update.apply(this, [updatedEntity]);

            dataStore.setItem(updatedEntity.getId(), updatedEntity).then(function (updatedEntityConfig) {
                resolve(updatedEntity);
            }).catch(function (error) {
                reject(new BytePushers.adapter.DaoAdapterException(error));
            });
        });

        return promise;

    };

    BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.delete = function(entityId) {
        var promise = new Promise(function(resolve, reject) {
            var dataStore = this.getDataStore();

            BytePushers.adapter.LocalForageBaseDaoAdapter.prototype.superclass.prototype.delete.apply(this, [entityId]);

            dataStore.removeItem(entityId).then(function () {
                resolve();
            }).catch(function (error) {
                reject(new BytePushers.adapter.DaoAdapterException(error));
            });

        });

        return promise;
    };

    PMMS.adapter.LocalForageBaseDaoAdapter.prototype = BytePushers.inherit(PMMS.adapter.BaseEntity.prototype);
    PMMS.adapter.LocalForageBaseDaoAdapter.prototype.constructor = PMMS.adapter.LocalForageBaseDaoAdapter;
    PMMS.adapter.LocalForageBaseDaoAdapter.prototype.superclass = PMMS.adapter.BaseDaoAdapter;

})(window, document, BytePushers);