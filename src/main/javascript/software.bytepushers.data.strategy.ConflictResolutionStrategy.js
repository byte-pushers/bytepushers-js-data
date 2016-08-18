/**
 * Created by tonte on 8/16/16.
 */
/*global console, BytePushers*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.strategy = BytePushers.strategy ||  BytePushers.namespace("software.bytepushers.data.strategy");

    BytePushers.strategy.ConflictResolutionStrategy = function ConflictResolutionStrategy(onlineStatus) {
        var online = Boolean(onlineStatus);

        this.synchronizeData = function (daoManager, dataSynchronizationService) {
            if (!BytePushers.strategy.ConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
            }

            if (online) {
                this.synchronizeOnlineData(daoManager, dataSynchronizationService);
            } else {
                this.synchronizeOfflineData(daoManager);
            }
        };

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionStrategy.prototype.synchronizeOnlineData = function () {
            //todo: save work order queue to off-line data base.
            if (!BytePushers.strategy.ConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
            }

            throw new BytePushers.data.DataException("abstract method");
        };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionStrategy.prototype.synchronizeOfflineData = function () {
            //todo: get work order queue from off-line data base.
            if (!BytePushers.strategy.ConflictResolutionStrategy.prototype.isPrototypeOf(this)) {
                throw new BytePushers.data.DataException("Can not call object unless in Object's hierarchy prototype chain.");
            }

            throw new BytePushers.data.DataException("abstract method");
        };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionStrategy.prototype.convertResultsToMap = function(objects) {
            var objectMap = new Map();

            if (Object.isArray(objects)) {
                objects.forEach(function(object) {
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

/*
WorkOrderQueueService.getLastSynchronized().then(function(lastSynchronizedTime) {
    return WorkOrderQueueService.getChanges(lastSynchronizedTime);
}).then(function(workOrderChanges) {
    return WorkOrderQueueService.applyChanges(workOrderChanges);
}).catch(function(error) {

});

WorkOrderQueueService.getQueueByShopId(shopId).then(function(persistedWorkOrders) {
    //todo: save work order queue to off-line data base.
    persistedWorkOrders.forEach(function(persistedWorkOrder) {
        detachedWorkOrder = workOrderDao.findById(persistedWorkOrder.getId());

        if (angular.isDefined(detachedWorkOrder)) {
            if (detachedWorkOrder.getLastModifiedDate()) {

            }
        }
    });
}).then(function(workOrderQueue) {
    //todo: get work order queue from off-line data base.

    deferred.resolve(self.successfulQueryCallBack(response));
}).catch(function(error) {
    //todo: handle error
});
*/