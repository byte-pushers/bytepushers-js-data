/**
 * Created by tonte on 8/23/16.
 */
/*global console, BytePushers*/
/* jshint -W108, -W109, -W054 */
(function (BytePushers) {
    'use strict';

    BytePushers = BytePushers || {};
    BytePushers.model = BytePushers.model || BytePushers.namespace("software.bytepushers.data.model");

    BytePushers.model.NoSqlId = function NoSqlId(noSqlIdJsonConfig) {
        var id = (Object.isDefined(noSqlIdJsonConfig) && Object.isNumeric(noSqlIdJsonConfig.id)) ? noSqlIdJsonConfig.id : null,
            demoMode = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.demoMode)) ? noSqlIdJsonConfig.demoMode : null,
            entityType = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.entityType)) ? noSqlIdJsonConfig.entityType : null,
            dataId = (Object.isDefined(noSqlIdJsonConfig) && Object.isString(noSqlIdJsonConfig.dataId)) ? noSqlIdJsonConfig.dataId : null,
            dataShopId =
                (Object.isDefined(noSqlIdJsonConfig) && Object.isNumeric(noSqlIdJsonConfig.dataShopId)) ? noSqlIdJsonConfig.dataShopId : null,
            dataLastModifiedTime =
                (Object.isDefined(noSqlIdJsonConfig) &&
                Object.isNumeric(noSqlIdJsonConfig.dataLastModifiedTime)) ? noSqlIdJsonConfig.dataLastModifiedTime : null;

        this.getId = function () {
            return id;
        };

        this.getDemoMode = function () {
            return demoMode;
        };

        this.getEntityType = function () {
            return entityType;
        };

        this.getDataId = function () {
            return dataId;
        };

        this.getShopId = function () {
            return dataShopId;
        };

        this.getDataLastModifiedTime = function () {
            return dataLastModifiedTime;
        };

        BytePushers.model.NoSqlId.prototype.toJSON = function (returnJsonAsString) {

            returnJsonAsString = Boolean(returnJsonAsString);

            var jsonId = (Object.isNumeric(this.getId())) ? this.getId() : null,
                jsonDemoMode = (Object.isString(this.getDemoMode())) ? "\"" + this.getDemoMode() + "\"" : null,
                jsonEntityType = (Object.isString(this.getEntityType())) ? "\"" + this.getEntityType() + "\"" : null,
                jsonDataId = (Object.isString(this.getDataId())) ? "\"" + this.getDataId() + "\"" : null,
                jsonDataShopId = (Object.isNumeric(this.getShopId())) ? this.getShopId() : null,
                jsonDataLastModifiedTime = (Object.isNumeric(this.getDataLastModifiedTime())) ? this.getDataLastModifiedTime() : null,
                json = "{" +
                    "\"id\": " + jsonId + "," +
                    "\"demoMode\": " + jsonDemoMode + "," +
                    "\"entityType\": " + jsonEntityType + "," +
                    "\"dataId\": " + jsonDataId + "," +
                    "\"dataShopId\": " + jsonDataShopId + "," +
                    "\"dataLastModifiedTime\": " + jsonDataLastModifiedTime +
                    "}";
            return returnJsonAsString ? json : JSON.parse(json);
        };

        BytePushers.model.NoSqlId.prototype.toString = function () {
            return "NoSqlId {" +
                "id=" + this.getId() + "," +
                "demoMode=" + this.getDemoMode() + "," +
                "entityType=" + this.getEntityType() + "," +
                "dataId=" + this.getDataId() + "," +
                "dataShopId=" + this.getShopId() + "," +
                "dataLastModifiedTime=" + this.getDataLastModifiedTime().toString() +
                "}";
        };

    };
}(BytePushers));
