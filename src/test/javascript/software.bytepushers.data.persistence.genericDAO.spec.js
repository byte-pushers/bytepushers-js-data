/**
 * Created by tonte on 7/17/16.
 */

define(['BytePushers', 'localforage', 'Person', 'bytePushersLocalForageDao', 'bytePushersDaoManager'], function (BytePushers, localforage) {
    describe("BytePushers Generic DAO", function () {
        beforeAll(function () {
            expect(localforage).toBeDefined();
        });

        it('should be able to do CRUD operations', function (done) {
            var personEntityConfig = {
                    entityIdValidationMethod: function(someId) {
                        return true;
                    }
                },
                personConfig = {
                    firstName: "John",
                    lastName: "Doe",
                    birthDate: new Date("04-02-1978")
                },
                person = new BytePushers.models.Person(personConfig),
                daoConfig = {
                    name        : 'pmms-mobile-app',
                    version     : 1.0,
                    storeName   : 'pmms-mobile-app-data-store', // Should be alphanumeric, with underscores.
                    description : 'PMMS Mobile App Data Store',
                    Entity    : BytePushers.models.Person,
                    Dao         : BytePushers.dao.LocalForageDao,
                    dataStore   : localforage,
                    entityConfigs: {
                        personEntityConfig: {
                            entityIdValidationMethod: function(someId) {
                                return true;
                            }
                        }
                    }
                },
                personDao,
                expectedValues = {
                    firstName: "Kevin",
                    lastName: "Doe",
                    birthDate: new Date("04-02-1978")
                },
                createPerson = function(newPerson) {
                    return personDao.create(newPerson).then(function(newlyPersistedPerson) {
                        expect(newlyPersistedPerson).toBeDefined();
                        expect(newlyPersistedPerson.getId()).not.toBeNull();
                        return newlyPersistedPerson;
                    });
                },
                readPerson = function(persistedPerson) {
                    return personDao.read(persistedPerson.getId()).then(function(previouslyPersistedPerson) {
                        expect(previouslyPersistedPerson).toBeDefined();
                        expect(previouslyPersistedPerson.toJSON()).toEqual(persistedPerson.toJSON());
                        return previouslyPersistedPerson;
                    });
                },
                updatePerson = function(previouslyPersistedPerson) {
                    var previouslyPersistedPersonConfig = previouslyPersistedPerson.toJSON(),
                        updatedPerson;

                    previouslyPersistedPersonConfig.firstName = expectedValues.firstName;
                    updatedPerson = new BytePushers.models.Person(previouslyPersistedPersonConfig);

                    return personDao.update(updatedPerson).then(function(updatedPerson) {
                        expect(updatedPerson).toBeDefined();
                        expect(updatedPerson.getFirstName()).toBe(expectedValues.firstName);
                        expect(updatedPerson.getLastName()).toBe(expectedValues.lastName);
                        return updatedPerson;
                    });
                },
                deletePerson = function(persistedPerson) {
                    return personDao.delete(persistedPerson.getId()).then(function(personDeleted) {
                        expect(personDeleted).toBe(true);
                        if (personDeleted) {
                            personDao.read(persistedPerson.getId()).then(function(persistedPerson) {
                                if(persistedPerson) {
                                    fail("expected to not find the same person after delete operation.");
                                }
                                //expect(persistedPerson).not.toBeDefined();
                            }, function(error) {
                                expect(error).toBeDefined();
                            })
                        } else {
                            fail("delete operation did not return true; but instead returned: "  + personDeleted);
                        }
                    });
                },
                end = function() {
                    done();
                };

            expect(BytePushers.dao.LocalForageDao).toBeDefined();
            expect(BytePushers.models.Person).toBeDefined();
            expect(BytePushers.dao.DaoManager).toBeDefined();
            expect(BytePushers.dao.DaoManager.getInstance()).toBeDefined();
            BytePushers.dao.DaoManager.getInstance().registerDao(daoConfig);
            personDao = BytePushers.dao.DaoManager.getInstance().getDao("PersonLocalForageDao");

            expect(person.getId()).toBeNull();
            createPerson(person).then(readPerson).then(updatePerson).then(deletePerson).then(end).catch(function(error) {
                expect(error).toBeUndefined();
            });
        });
    });
});