/**
 * Created by tonte on 7/24/16.
 */
define(['BytePushers', /*'parseFunction', */'Person', 'polyfill'/*, 'defineProperty', 'acorn'*/], function(BytePushers/*, parseFunction*/) {
    describe("BytePushers polyfill", function() {
        it('should be able to determine constructor methods', function() {
            var personConfig = {
                    firstName: "John",
                    lastName:  "Doe",
                    birthDate: new Date("04-02-1978")
                },
                person = new BytePushers.models.Person(personConfig);

            expect(person).toBeDefined();
            expect(Object.isFunction(BytePushers.models.Person)).toBe(true);
            expect(Object.isConstructorFunction(BytePushers.models.Person)).toBe(true);
        });

        it('should be able to call private methods', function() {
            var createdDate = new Date(),
                personConfig = {
                    firstName: "John",
                    lastName:  "Doe",
                    birthDate: new Date("04-02-1978"),
                    createdDate: createdDate,
                    lastModifiedDate: createdDate
                },
                person = new BytePushers.models.Person(personConfig),
                reflection = (new BytePushers.util.Reflection()).getInstance(BytePushers.models.Person, personConfig),
                reflectionMethodSetId = reflection.getMethod("setId"),
                reflectionMethodSetIdAgain = reflection.getMethod("setIdAgain"),
                reflectionMethodSetFirstName = reflection.getMethod("setFirstName"),
                reflectionMethodSetSocialSecurityNumber = reflection.getMethod("setSocialSecurityNumber");

            expect(person).toBeDefined();
            expect(reflection).toBeDefined();
            expect(reflection.toJSON).toBeDefined();
            expect(person.toJSON()).toEqual(reflection.toJSON());
            expect(reflection.getId()).toBeNull();
            reflectionMethodSetId(1);
            expect(reflection.getId()).toBe(1);
            reflectionMethodSetIdAgain(2);
            expect(reflection.getId()).toBe(2);
            reflectionMethodSetFirstName("Ray");
            expect(reflection.getFirstName()).toBe("Ray");
            reflectionMethodSetSocialSecurityNumber(111223333);
            expect(reflection.getSocialSecurityNumber()).toBe(111223333);
        });
    });
});