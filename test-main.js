var allTestFiles = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Spec\.js$/.test(file)) {
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
      'bytePushersLocalForageDao': 'src/main/javascript/software.bytepushers.data.dao.LocalForageDao'
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
          deps: ['bytepushers']
      }
  },

  deps: allTestFiles,

  callback: window.__karma__.start
});
