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

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionStrategy.prototype.synchronizeOnlineData = function (searchCriteria, lastSynchronizedTime, daoManager, dataSynchronizationService) {
            //todo: save work order queue to off-line data base.
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

                    daoManager.find(searchCriteria).then(function(searchCriteriaDetachedObjects) {
                        var detachedSearchCriteriaResultMapPopulated = false;
                        searchCriteriaDetachedObjects.forEach(function(searchCriteriaDetachedObject) {
                            if (BytePushers.implementsInterface(searchCriteriaDetachedObject, "getNoSqlId")) {
                                detachedSearchCriteriaResultMap.set(searchCriteriaDetachedObject.getNoSqlId(), searchCriteriaDetachedObject);
                                detachedSearchCriteriaResultMapPopulated = true;
                            } else {
                                console.log("Warning: " + searchCriteriaDetachedObject + " does not implement getNoSqlId() method.");
                            }
                        });

                        return detachedSearchCriteriaResultMapPopulated;
                    }).then(function(detachedSearchCriteriaResultMapPopulated) {
                        return dataSynchronizationService.getChanges(lastSynchronizedTime);
                    }).then(function(conflictingPersistedObjects) {
                        var conflictingDetachedObject;

                        conflictingPersistedObjects.forEach(function(conflictingPersistedObject, conflictingPersistedObjectIndex) {
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

                        resolve(status);
                    }).catch(function(error) {
                        reject(new BytePushers.dao.DataException(error));
                    });
                });

            return promise;
        };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionStrategy.prototype.synchronizeOfflineData = function (daoManager) {
            //todo: get work order queue from off-line data base.
            var promise = new Promise(function (resolve, reject) {

                });

            return promise;
        };
        /*jshint unused:false*/
    };
}(BytePushers));