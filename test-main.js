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
      'BytePushers': 'bower_components/bytepushers-js-core/release/bytepushers-js-core',
      'bytePushersDaoManager': 'src/main/javascript/software.bytepushers.data.dao.DaoManager',
      'bytePushersGenericDao': 'src/main/javascript/software.bytepushers.data.dao.GenericDao',
      'bytePushersGenericDaoException': 'src/main/javascript/software.bytepushers.data.dao.GenericDaoException',
      'bytePushersLocalForageDao': 'src/main/javascript/software.bytepushers.data.dao.LocalForageDao',

      'BaseEntity': 'src/test/javascript/support/software.bytepushers.model.BaseEntity',
      'Person': 'src/test/javascript/support/software.bytepushers.model.Person'
  },

  shim: {
      BytePushers: {
          exports: 'BytePushers'
      },
      bytePushersDaoManager: {
          deps: ['bytePushersGenericDaoException']
      },
      bytePushersGenericDao: {
          deps: ['BytePushers']
      },
      bytePushersGenericDaoException: {
          deps: ['bytePushersGenericDao']
      },
      bytePushersLocalForageDao: {
          deps: ['bytePushersGenericDao']
      },
      BaseEntity: {
          deps: ['BytePushers']
      },
      Person: {
          deps: ['BytePushers', 'BaseEntity']
      }
  },

  deps: allTestFiles,

  callback: window.__karma__.start
});
