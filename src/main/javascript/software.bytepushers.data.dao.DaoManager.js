/**
 * Created by tonte on 7/20/16.
 */
(function(window, document, BytePushers) {
    var getConcreteDaoImplName = function(Dao, entityName) {
        var concreteDaoImplName;

        if(Object.isDefined(Dao)) {
            throw new BytePushers.daoGenericDaoException("DAO Adapter(" + Dao + ") constructor method must be defined.");
        }

        if(Object.isDefined(entityName)) {
            throw new BytePushers.dao.GenericDaoException("Entity Name(" + entityName + ") must be defined.");
        }

        if(Object.isConstructorFunction(Dao)){
            concreteDaoImplName = Dao.name.substringBefore("GenericDao");
            concreteDaoImplName = Dao.name.substringBefore("BaseDao");
            concreteDaoImplName = Dao.name.substringBefore("Dao");

            if(concreteDaoImplName.trim().length === 0){
                throw new BytePushers.dao.GenericDaoException("DAO Adapter(" + Dao + ") constructor method must be prefixed with the name of the platform it implements.  For example, 'LocalForage' is the prefix in 'LocalForageBaseDaoAdapter'.");
            }
        }

        return entityName + concreteDaoImplName;
    };

    var getEntityName = function(Entity) {
        var entityName;

        if(Object.isDefined(Entity)) {
            throw new BytePushers.dao.GenericDaoException("Entity(" + Entity + ") constructor method must be defined.");
        }

        if(Object.isConstructorFunction(Entity)){
            entityName = Entity.name;
        }

        return entityName;
    };

    BytePushers = BytePushers || {};
    BytePushers.dao = BytePushers.dao ||  BytePushers.namespace("software.bytepushers.data.dao");

    BytePushers.dao.DaoManager = (function () {
        var instance, registeredDaoConstructors;

        function getDao(daoName) {
            var dao = null;

            if(typeof registeredDaoConstructors[daoName] === "object"){
                dao = registeredDaoConstructors[daoName]
            }

            if(Object.isConstructorFunction(registeredDaoConstructors[daoName])){
                dao = new registeredDaoConstructors[daoName]();
            }

            return dao;
        };

        function registerDao(Entity, Dao) {
            var entityName = getEntityName(Entity),
                concreteDaoName = getConcreteDaoImplName(Dao, entityName),
                concreteDaoNameImpl = concreteDaoName + "Impl",
                generatateConcreteDaoConstructor = new Function('return function ' + concreteDaoName + '() {' +
                    'def.useClass.call(this, def[def.class].arguments[1]); ' +
                '}')(),
                ConcreteDaoImplConstructor = generatateConcreteDaoConstructor();

            ConcreteDaoImplConstructor.prototype = BytePushers.inherit(BytePushers.GenericDaoLocalForage);
            ConcreteDaoImplConstructor.prototype.constructor = ConcreteDaoImplConstructor;
            ConcreteDaoImplConstructor.prototype.superclass = BytePushers.GenericDaoLocalForage;

            registeredDaoConstructors[concreteDaoName] = ConcreteDaoImplConstructor;
            registeredDaoConstructors[concreteDaoNameImpl] = null;
        };

        return {
            getInstance:  function () {
                if (instance === undefined) {
                    instance = {
                      getDao: getDao,
                      registerDao: registerDao
                    };
                }
                return instance;
            }
        };
    })();
})(window, document, BytePushers);
