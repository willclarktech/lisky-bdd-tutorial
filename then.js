const assert = require('assert');

const getFirstQuotedString = title => title.match(/"((.)+?)"/)[1];

function itShouldReturn() {
	const { returnValue } = this.test.ctx;
	const expectedValue = getFirstQuotedString(this.test.title);
	return assert.strictEqual(returnValue, expectedValue);
}

module.exports = {
	itShouldReturn,
}
