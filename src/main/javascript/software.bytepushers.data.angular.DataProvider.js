/**
 * Created by tonte on 8/16/16.
 */
/*global angular, localforage, BytePushers, localforageFind*/
/* jshint -W108, -W109 */
angular.module('software.bytepushers.data.provider', []);
angular.module('software.bytepushers.data.provider').provider('DataProvider', function () {
    "use strict";
    var dataProviderConfig;

    this.$get = function () {
        if (!angular.isDefined(dataProviderConfig)) {
            throw new BytePushers.dao.DaoException("No DAO Configuration defined.");
        }

        if (!angular.isArray(dataProviderConfig.entities)) {
            throw new BytePushers.dao.DaoException("No DAO Entity Configurations defined.");
        }

        if (angular.isArray(dataProviderConfig.entities) && dataProviderConfig.entities.length === 0) {
            throw new BytePushers.dao.DaoException("No DAO Entity Configurations defined.");
        }

        dataProviderConfig.entities.forEach(function (entityClassName) {
            BytePushers.dao.DaoManager.getInstance().registerDao({
                name        : 'pmms-mobile-app',
                version     : 1.0,
                storeName   : 'pmms-mobile-app-data-store', // Should be alphanumeric, with underscores.
                description : 'PMMS Mobile App Data Store',
                Entity      : entityClassName,
                Dao         : BytePushers.dao.LocalForageDao,
                dataStore   : localforage,
                entityConfigs: {
                    personEntityConfig: {
                        entityIdValidationMethod: function () {
                            return true;
                        }
                    }
                }
            });
        });

        localforageFind(localforage);
        return BytePushers.dao.DaoManager.getInstance();
    };

    this.setDataProviderConfig = function (jsonDaoConfig) {
        dataProviderConfig = jsonDaoConfig;
    };

    this.getDataProviderConfig = function () {
        return dataProviderConfig;
    };
});