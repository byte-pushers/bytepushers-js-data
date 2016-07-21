/**
 * Created by tonte on 7/17/16.
 */
define(['BytePushers', 'Person', 'bytePushersLocalForageDao', 'bytePushersDaoManager'], function(BytePushers) {
    describe("Bytepushers Generic DAO", function() {
        it('should be able to do CRUD operations', function() {
            var personConfig = {
                    firstName: "John",
                    lastName:  "Doe",
                    birthDate: new Date("04-02-1978")
                },
                person = new BytePushers.models.Person(personConfig),
                personDao,
                persistedPerson;

            BytePushers.dao.DaoManager.getInstance()
              .registerDao(
                BytePushers.models.Person,
                BytePushers.dao.LocalForageDao
              );
            personDao = BytePushers.dao.DaoManager.getInstance().getDao("PersonLocalForageDao");

            expect(person.getId()).toBeNull();
            personDao.create(person);
            expect(person.getId()).not.toBeNull();

            persistedPerson = personDAO.get(person.getId());
            expect(persistedPerson).toBeDefined();
            expect(persistedPerson).toEqual(person);
        });
    });
});
