define(['bytepushers', 'Person'], function(BytePushers) {
    describe("Person Text", function() {
        it('should be able to do CRUD operations', function() {
            var personConfig = {
                    firstName: "John",
                    lastName:  "Doe",
                    birthDate: new Date("04-02-1978")
                },
                person = new BytePushers.models.Person(personConfig);

            expect(person).toBeDefined();
            expect(person.getFirstName()).toBe('John');
        });
    });
});
