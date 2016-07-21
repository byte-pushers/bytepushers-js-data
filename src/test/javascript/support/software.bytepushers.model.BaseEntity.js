/* jshint -W108, -W109 */
define(['bytepushers'], function(BytePushers) {
  var PMMS;

  if (window.PMMS !== undefined && window.PMMS !== null) {
    PMMS = window.PMMS;
  } else {
    window.PMMS = {};
    PMMS = window.PMMS;
  }

  PMMS.models = BytePushers.namespace("gov.llnl.models");

  /**
   * A convenient function that can be used for any abstract method
   */
  PMMS.models.abstractMethod = function () {
    throw new Error("abstract method");
  };

  PMMS.models.BaseEntity = function BaseEntity(baseEntityJsonConfig) {
    var self = this,
        id = (Object.isDefined(baseEntityJsonConfig) && Object.isNumeric(baseEntityJsonConfig.id))?
          baseEntityJsonConfig.id: null,
        createdDate = (Object.isDefined(baseEntityJsonConfig) && Object.isDefined(baseEntityJsonConfig.createdDate)) ?
          new Date(baseEntityJsonConfig.createdDate): new Date(),
        lastModifiedDate = (Object.isDefined(baseEntityJsonConfig) && Object.isDefined(baseEntityJsonConfig.lastModifiedDate)) ?
          new Date(baseEntityJsonConfig.lastModifiedDate): createdDate,
        createdBy = (Object.isDefined(baseEntityJsonConfig) && Object.isDefined(baseEntityJsonConfig.createdBy))?
          baseEntityJsonConfig.createdBy: null,
        lastModifiedBy = (Object.isDefined(baseEntityJsonConfig) && Object.isDefined(baseEntityJsonConfig.lastModifiedBy)) ?
          baseEntityJsonConfig.lastModifiedBy: null;

    this.getId = function() {
      return id;
    };

    this.getCreatedDate = function() {
      return createdDate;
    };

    this.getLastModifiedDate = function() {
      return lastModifiedDate;
    };

    this.getCreatedBy = function() {
      return createdBy;
    };

    this.getLastModifiedBy = function() {
      return lastModifiedBy;
    };

    this.formatJsonCreatedDateProperty = function() {
      return (Object.isDate(this.getCreatedDate()))? "\"" + this.getCreatedDate().toJSON() + "\"" : null;
    };

    this.formatJsonLastModifiedDateProperty = function() {
      return (Object.isDate(this.getLastModifiedDate()))?"\""+this.getLastModifiedDate().toJSON()+"\"":null;
    };

    this.formatJsonCreatedByProperty = function() {
      return (Object.isDefined(this.getCreatedBy()))? "\"" + this.getCreatedBy() + "\"" : null;
    };

    this.formatJsonLastModifiedByProperty = function() {
      return (Object.isDefined(this.getLastModifiedBy()))? "\"" + this.getLastModifiedBy() + "\"" : null;
    };
  };

  PMMS.models.BaseEntity.prototype.formatJsonIdProperty = function() {
    return (Object.isNumeric(this.getId()))? this.getId() : (Object.isString(this.getId()))? "\"" + this.getId() + "\"" : null;
  };

  PMMS.models.BaseEntity.prototype.toJSON = function(serializeUIProperties, useWrapper, includeId) {
    serializeUIProperties = this.useSerializeUIProperties(serializeUIProperties);
    useWrapper = this.shouldUseWapper(useWrapper);
    includeId = this.shouldIncludeId(includeId);
    var jsonId = this.formatJsonIdProperty(),
      jsonCreatedDate = this.formatJsonCreatedDateProperty(),
      jsonLastModifiedDate = this.formatJsonLastModifiedDateProperty(),
      jsonCreatedBy = this.formatJsonCreatedByProperty(),
      jsonLastModifiedBy = this.formatJsonLastModifiedByProperty(),
      json =  ((useWrapper)? "{": "") +
        ((includeId)? "\"id\": " + jsonId + "," : "") +
        "\"createdDate\": " + jsonCreatedDate + "," +
        "\"lastModifiedDate\": " + jsonLastModifiedDate + "," +
        "\"createdBy\": " + jsonCreatedBy + "," +
        "\"lastModifiedBy\": " + jsonLastModifiedBy +
        ((useWrapper)? "}": "");
    return json;
  };

  PMMS.models.BaseEntity.prototype.toString = function (useWrapper, includeId) {
    useWrapper = (Object.isBoolean(useWrapper))? useWrapper : true;
    includeId = (Object.isBoolean(includeId))? includeId : true;
    return  ((useWrapper)? "Base Entity {": "") +
      ((includeId)? "id: " + this.getId() + ", " : "") +
      "createdDate: \"" + this.getCreatedDate().toJSON() + "\", " +
      "lastModifiedDate: \"" + this.getLastModifiedDate().toJSON() + "\", " +
      "createdBy: \"" + this.getCreatedBy() + "\", " +
      "lastModifiedBy: \"" + this.getLastModifiedBy() + "\"" +
    ((useWrapper)? "}": "");
  };

  PMMS.models.BaseEntity.prototype.useSerializeUIProperties = function(serializeUIProperties) {
    return (Object.isBoolean(serializeUIProperties))? serializeUIProperties : false;
  };

  PMMS.models.BaseEntity.prototype.shouldUseWapper = function(useWrapper) {
    return (Object.isBoolean(useWrapper))? useWrapper : true;
  };

  PMMS.models.BaseEntity.prototype.shouldIncludeId = function(includeId) {
    return (Object.isBoolean(includeId))? includeId : true;
  };

});
