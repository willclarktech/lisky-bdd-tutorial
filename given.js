const getFirstQuotedString = title => title.match(/"((.)+?)"/)[1];

function aName() {
  this.test.ctx.name = getFirstQuotedString(this.test.parent.title);
}

function aLanguage() {
  this.test.ctx.language = getFirstQuotedString(this.test.parent.title);
}

const anUnknownLanguage = aLanguage;

module.exports = {
  aName,
  aLanguage,
  anUnknownLanguage
};
