const when = require('./when');
const then = require('./then');

describe('wishHappyBirthday', () => {
	describe('When wishHappyBirthday is called with the name and the language', () => {
		beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
		it('Then it should return "Happy birthday, Lisky!"', then.itShouldReturn);
	});
});
