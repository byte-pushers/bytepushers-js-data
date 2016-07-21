/* jshint -W108, -W109 */

/**
 * Created by tonte on 7/17/16.
 */
(function(window, document, BytePushers) {

    BytePushers.persistence = BytePushers.namespace("software.bytepushers.data.persistence");

    var Entity, isEntityIdValid;


    var getEntityIdValidationMethod = function(daoConfig) {
        return (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.entityIdVaidationMethod))?
            daoConfig.entityIdVaidationMethod : function() {};
    };

    BytePushers.persistence.GenericDAO = function (daoConfig) {
        Entity = (Object.isDefined(daoConfig) && Object.isFunction(daoConfig.Entity))? daoConfig.Entity : null;
        isEntityIdValid = getEntityIdValidationMethod(daoConfig);
    };

    BytePushers.persistence.GenericDAO.prototype.isEntityIdValid = isEntityIdValid;

    BytePushers.persistence.GenericDAO.prototype.createEntity = function(entityConfig) {
        var entity;

        if(!BytePushers.persistence.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
           throw new BytePushers.persistence.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        entity = new Entity(entityConfig);
        return entity;
    };

    BytePushers.persistence.GenericDAO.prototype.create = function(newEntity) {
        if(!BytePushers.persistence.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.persistence.GenericDaoException("abstract method");
    };

    BytePushers.persistence.GenericDAO.prototype.read = function(entityId) {
        if(!BytePushers.persistence.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.persistence.GenericDaoException("abstract method");
    };

    BytePushers.persistence.GenericDAO.prototype.update = function(existingEntity) {
        if(!BytePushers.persistence.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.persistence.GenericDaoException("abstract method");
    };

    BytePushers.persistence.GenericDAO.prototype.delete = function(entityId) {
        if(!BytePushers.persistence.GenericDAO.prototype.isPrototypeOf(arguments.callee.caller)) {
            throw new BytePushers.persistence.GenericDaoException("Can not call object unless in Object's hierarchy prototype chain.");
        }

        throw new BytePushers.persistence.GenericDaoException("abstract method");
    };

    BytePushers.persistence.GenericDAO.prototype.createLocalForageDao = function(Entity, DaoAdapter) {
        var entityName = getEntityName(Entity),
            concreteDaoImplName = getConcreteDaoImplName(DaoAdapter, entityName),
            daoAdapter = new DaoAdapter();
            generatateConcreteDaoConstructor = new Function('entity', 'concreteDaoImpl', 'return function ' + concreteDaoImplName + '() {' +
                'def.useClass.call(this, def[def.class].arguments[1]); ' +
            '}')(def),
            ConcreteDaoImplConstructor = generatateConcreteDaoConstructor();

        ConcreteDaoImplConstructor.prototype = BytePushers.inherit(BytePushers.persistence.GenericDaoLocalForage);
        ConcreteDaoImplConstructor.prototype.constructor = ConcreteDaoImplConstructor;
        ConcreteDaoImplConstructor.prototype.superclass = BytePushers.persistence.GenericDaoLocalForage;

        ConcreteDaoImplConstructor.prototype.create = function(newlyCreatedEntity) {

        };

        return new ConcreteDaoImplConstructor();
    };

})(window, document, BytePushers);