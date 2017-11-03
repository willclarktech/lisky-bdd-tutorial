const wishHappyBirthday = require('./source');

function wishHappyBirthdayIsCalledWithTheNameAndTheLanguage() {
	const { name, language } = this.test.ctx;
	this.test.ctx.returnValue = wishHappyBirthday(name, language);
}

module.exports = {
	wishHappyBirthdayIsCalledWithTheNameAndTheLanguage,
};
