/**
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
}(BytePushers));