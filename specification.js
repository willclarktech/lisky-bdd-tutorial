const given = require('./given');
const when = require('./when');
const then = require('./then');

describe('wishHappyBirthday', () => {
	describe('Given a name "Lisky"', () => {
		beforeEach(given.aName);
		describe('Given a language "English"', () => {
			beforeEach(given.aLanguage);
			describe('When wishHappyBirthday is called with the name and the language', () => {
				beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
				it('Then it should return "Happy birthday, Lisky!"', then.itShouldReturn);
			});
		});
		describe('Given a language "Deutsch"', () => {
			beforeEach(given.aLanguage);
			describe('When wishHappyBirthday is called with the name and the language', () => {
				beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
				it('Then it should return "Herzlichen Glückwunsch zum Geburtstag, Lisky!"', then.itShouldReturn);
			});
		});
	});
	describe('Given a name "Satoshi"', () => {
		beforeEach(given.aName);
		describe('Given a language "English"', () => {
			beforeEach(given.aLanguage);
			describe('When wishHappyBirthday is called with the name and the language', () => {
				beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
				it('Then it should return "Happy birthday, Satoshi!"', then.itShouldReturn);
			});
		});
		describe('Given a language "Deutsch"', () => {
			beforeEach(given.aLanguage);
			describe('When wishHappyBirthday is called with the name and the language', () => {
				beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
				it('Then it should return "Herzlichen Glückwunsch zum Geburtstag, Satoshi!"', then.itShouldReturn);
			});
		});
	});
});
