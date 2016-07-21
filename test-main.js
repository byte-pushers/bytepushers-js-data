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
      'bytepushers': 'bower_components/bytepushers-js-core/release/bytepushers-js-core',
      'bytePushersDaoManager': 'src/main/javascript/software.bytepushers.data.dao.DaoManager',
      'bytePushersGenericDao': 'src/main/javascript/software.bytepushers.data.dao.GenericDao',
      'bytePushersGenericDaoException': 'src/main/javascript/software.bytepushers.data.dao.GenericDaoException',
      'bytePushersLocalForageDao': 'src/main/javascript/software.bytepushers.data.dao.LocalForageDao',

      'BaseEntity': 'src/test/javascript/support/software.bytepushers.model.BaseEntity',
      'Person': 'src/test/javascript/support/software.bytepushers.model.Person'
  },

  shim: {
      bytepushers: {
          exports: 'BytePushers'
      },
      bytePushersDaoManager: {
          deps: ['bytepushers']
      },
      bytePushersGenericDao: {
          deps: ['bytepushers']
      },
      bytePushersGenericDaoException: {
          deps: ['bytepushers']
      },
      bytePushersLocalForageDao: {
          deps: ['bytePushersGenericDao','bytepushers']
      },
      BaseEntity: {
          deps: ['bytepushers']
      },
      Person: {
          deps: ['bytepushers', 'BaseEntity']
      }
  },

  deps: allTestFiles,

  callback: window.__karma__.start
});
