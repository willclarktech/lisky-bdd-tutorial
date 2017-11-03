const assert = require('assert');

const getFirstQuotedString = title => title.match(/"((.)+?)"/)[1];

function itShouldReturn() {
	const { returnValue } = this.test.ctx;
	const expectedValue = getFirstQuotedString(this.test.title);
	return assert.strictEqual(returnValue, expectedValue);
}

function itShouldThrowAnError() {
	const { error } = this.test.ctx;
	const expectedMessage = getFirstQuotedString(this.test.title);
	return assert.strictEqual(error.message, expectedMessage);
}

module.exports = {
	itShouldReturn,
	itShouldThrowAnError,
}
