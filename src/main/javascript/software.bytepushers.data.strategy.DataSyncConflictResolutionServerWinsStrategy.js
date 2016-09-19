/**
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
