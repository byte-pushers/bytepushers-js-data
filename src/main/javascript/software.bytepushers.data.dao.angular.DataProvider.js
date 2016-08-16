/**
 * Created by tonte on 8/16/16.
 */
/*global angular, BytePushers*/
/* jshint -W108, -W109 */
angular.module('software.bytepushers.data.provider', []);
angular.module('software.bytepushers.data.provider').provider('DataProvider', function () {
    "use strict";
    var daoConfig;

    this.$get = function () {
        if (!angular.isDefined(daoConfig)) {
            throw new BytePushers.dao.DaoException("No DAO Configuration definded.");
        }

        BytePushers.dao.DaoManager.getInstance().registerDao(daoConfig);

        return BytePushers.dao.DaoManager.getInstance();
    };

    this.setDaoConfig = function (jsonDaoConfig) {
        daoConfig = jsonDaoConfig;
    };

    this.getDaoConfig = function () {
        return daoConfig;
    };
});