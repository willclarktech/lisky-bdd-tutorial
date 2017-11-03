const getFirstQuotedString = title => title.match(/"((.)+?)"/)[1];

function aName() {
	this.test.ctx.name = getFirstQuotedString(this.test.parent.title);
}

function aLanguage() {
	this.test.ctx.language = getFirstQuotedString(this.test.parent.title);
}

module.exports = {
	aName,
	aLanguage,
}
