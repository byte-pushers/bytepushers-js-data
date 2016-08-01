var allTestFiles = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/\.spec\.js$/.test(file)) {
            allTestFiles.push(file);
        }
    }
}

require.config({
  baseUrl: '/base',

  paths: {
      /*'walk': 'node_modules/acorn/dist/acorn/walk',
      'acorn': 'node_modules/acorn/dist/acorn/acorn_loose',
      'isDescriptor': 'node_modules/define-property/node_modules.is-descriptor/index',
      'defineProperty': 'node_modules/define-property/index',
      'parseFunction': 'node_modules/parse-function/index',*/
      'localforage': 'bower_components/localforage/dist/localforage',
      /*'es6-promise': 'bower_components/es6-promise/promise',*/
      'BytePushers': 'bower_components/bytepushers-js-core/release/bytepushers-js-core',
      'bytePushersDaoManager': 'src/main/javascript/software.bytepushers.data.dao.DaoManager',
      'bytePushersGenericDao': 'src/main/javascript/software.bytepushers.data.dao.GenericDao',
      'bytePushersDaoException': 'src/main/javascript/software.bytepushers.data.dao.DaoException',
      'bytePushersLocalForageDao': 'src/main/javascript/software.bytepushers.data.dao.LocalForageDao',

      'BaseEntity': 'src/test/javascript/support/software.bytepushers.model.BaseEntity',
      'Person': 'src/test/javascript/support/software.bytepushers.model.Person',
      'polyfill': 'src/polyfill/object.polyfill'
  },

  shim: {
      BytePushers: {
          exports: 'BytePushers'
      },
      bytePushersDaoManager: {
          deps: ['bytePushersDaoException']
      },
      bytePushersGenericDao: {
          deps: ['BytePushers', 'polyfill']
      },
      bytePushersDaoException: {
          deps: ['BytePushers', 'bytePushersGenericDao']
      },
      bytePushersLocalForageDao: {
          deps: ['BytePushers', /*'es6-promise', */'localforage', 'bytePushersGenericDao', 'bytePushersDaoException', 'polyfill']
      },
      BaseEntity: {
          deps: ['BytePushers']
      },
      Person: {
          deps: ['BytePushers', 'BaseEntity']
      },
      polyfill: {
          deps: ['BytePushers'/*, 'parseFunction'*/]
      }/*,
      defineProperty: {
          deps: ['isDescriptor']
      },
      parseFunction: {
          deps: ['acorn', 'defineProperty']
      },
      acorn: {
          deps: ['walk']
      },
      walk: {

      }*/

  },

  deps: allTestFiles,

  callback: window.__karma__.start
});
