/**
 * Created by tonte on 8/16/16.
 */
/*global console, BytePushers*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.strategy = BytePushers.strategy ||  BytePushers.namespace("software.bytepushers.data.strategy");

    BytePushers.strategy.ConflictResolutionClientWinsStrategy = function ConflictResolutionClientWinsStrategy(onlineStatus) {
        var online = Boolean(onlineStatus);

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionClientWinsStrategy.prototype.synchronizeOnlineData = function (searchCriteria, lastSynchronizedTime, daoManager, dataSynchronizationService) {
            //todo: save work order queue to off-line data base.
            var promise = new Promise(function (resolve, reject) {

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

                dataSynchronizationService.getChanges(lastSynchronizedTime).then(function(conflictingPersistedObjects) {
                    return this.convertResultsToMap(conflictingPersistedObjects);
                }).then(function(conflictingPersistedObjectMap) {
                    daoManager.find(searchCriteria).then(function(searchCriteriaDetachedObjects) {
                        var conflictingPersistedObject;
                        searchCriteriaDetachedObjects.forEach(function(searchCriteriaDetachedObject) {
                            if (BytePushers.implementsInterface(detachedObject, "getNoSqlId")) {
                                conflictingPersistedObject = conflictingPersistedObjectMap.get(searchCriteriaDetachedObject.getNoSqlId());

                                if (Object.isDefined(conflictingPersistedObject)) {
                                    conflictingPersistedObjectMap.remove(conflictingPersistedObject.getNoSqlId());
                                }
                            } else {
                                console.log("Warning: " + searchCriteriaDetachedObject + " does not implement getNoSqlId() method.");
                            }

                            dataSynchronizationService.save(searchCriteriaDetachedObject);
                        });
                    });

                    return conflictingPersistedObjectMap;
                }).then(function(newlyPersistedObjectMap) {

                    if (Object.isDefined(newlyPersistedObjectMap)) {
                        newlyPersistedObjectMap.toArray().forEach(function(newlyPersistedObject) {
                            daoManager.create(newlyPersistedObject);
                            newlyPersistedObjectMap.remove(newlyPersistedObject.getNoSqlId());
                        });
                    }

                    resolve(true);
                }).catch(function(error) {
                    reject(new BytePushers.dao.DataException(error));
                });
            });

            return promise;
        };
        /*jshint unused:false*/

        /*jshint unused:true*/
        BytePushers.strategy.ConflictResolutionClientWinsStrategy.prototype.synchronizeOfflineData = function (daoManager) {
            //todo: get work order queue from off-line data base.
            var promise = new Promise(function (resolve, reject) {
                resolve(true);
            });

            return promise;
        };
        /*jshint unused:false*/
    };
}(BytePushers));

/*
daoManager.find(searchCriteria).then(function(detachedObjects) {
    conflictingPersistedObject = conflictingPersistedObjectMap.get(detachedObjects.getNoSqlId());
    if (detachedObjects.getLastSynchronizedDate() > conflictingPersistedObject.getLastModifiedDate()) {
        // detached object has been modified since last sync and changes should be pushed up to server.
    } else if (detachedObjects.getLastSynchronizedDate() < conflictingPersistedObject.getLastModifiedDate()) {
        // conflicting persisted object has been modified since last sync.
        if (detachedObjects.getLastModifiedDate() < conflictingPersistedObject.getLastModifiedDate()) {

        }
    } else {
        // no changes, but this should never happen because the search criteria should be checking
        // for dirty detached object.
    }

    conflictingPersistedObjectMap.remove(conflictingPersistedObject.getNoSqlId());
});
*/