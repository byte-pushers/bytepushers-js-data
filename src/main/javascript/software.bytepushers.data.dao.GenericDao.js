/* jshint -W108, -W109 */

/**
 * Created by tonte on 7/17/16.
 */
(function(window, document, BytePushers) {

    BytePushers.dao = BytePushers.namespace("software.bytepushers.data.dao");

    var Entity, isEntityIdValid;


    var getEntityIdValidationMethod = function(daoConfig) {
        return (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.entityIdVaidationMethod))?
            daoConfig.entityIdVaidationMethod : function() {};
    };

    BytePushers.dao.GenericDAO = function (daoConfig) {
        Entity = (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.Entity))? daoConfig.Entity : null;
        isEntityIdValid = getEntityIdValidationMethod(daoConfig);
    };

    BytePushers.dao.GenericDAO.prototype.isEntityIdValid = isEntityIdValid;

    BytePushers.dao.GenericDAO.prototype.createEntity = function(entityConfig) {
        var entity;

        if(!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
           throw new BytePushers.dao.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        entity = new Entity(entityConfig);
        return entity;
    };

    BytePushers.dao.GenericDAO.prototype.create = function(newEntity) {
        if(!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.GenericDaoException("abstract method");
    };

    BytePushers.dao.GenericDAO.prototype.read = function(entityId) {
        if(!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.GenericDaoException("abstract method");
    };

    BytePushers.dao.GenericDAO.prototype.update = function(existingEntity) {
        if(!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.GenericDaoException("abstract method");
    };

    BytePushers.dao.GenericDAO.prototype.delete = function(entityId) {
        if(!BytePushers.dao.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.dao.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.dao.GenericDaoException("abstract method");
    };

    BytePushers.dao.GenericDAO.prototype.createLocalForageDao = function(Entity, DaoAdapter) {
        var entityName = getEntityName(Entity),
            concreteDaoImplName = getConcreteDaoImplName(DaoAdapter, entityName),
            daoAdapter = new DaoAdapter();
            generatateConcreteDaoConstructor = new Function('entity', 'concreteDaoImpl', 'return function ' + concreteDaoImplName + '() {' +
                'def.useClass.call(this, def[def.class].arguments[1]); ' +
            '}')(def),
            ConcreteDaoImplConstructor = generatateConcreteDaoConstructor();

        ConcreteDaoImplConstructor.prototype = BytePushers.inherit(BytePushers.dao.GenericDaoLocalForage);
        ConcreteDaoImplConstructor.prototype.constructor = ConcreteDaoImplConstructor;
        ConcreteDaoImplConstructor.prototype.superclass = BytePushers.dao.GenericDaoLocalForage;

        ConcreteDaoImplConstructor.prototype.create = function(newlyCreatedEntity) {

        };

        return new ConcreteDaoImplConstructor();
    };

})(window, document, BytePushers);