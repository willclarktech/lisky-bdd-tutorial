const wishHappyBirthday = require("./source");

function wishHappyBirthdayIsCalledWithTheNameAndTheLanguage() {
  const { name, language } = this.test.ctx;
  try {
    this.test.ctx.returnValue = wishHappyBirthday(name, language);
  } catch (error) {
    this.test.ctx.error = error;
  }
}

module.exports = {
  wishHappyBirthdayIsCalledWithTheNameAndTheLanguage
};
