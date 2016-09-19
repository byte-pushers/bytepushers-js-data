/**
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