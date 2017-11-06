# BDD-style unit testing with Mocha

I’m the project lead on [Lisky][lisky], the command-line interface we’re building for developers to interact with [Lisk nodes][lisk-core] and perform other Lisk-related functions via the command line. We’ve recently adopted a BDD-style approach to unit tests in Lisky (from [v0.3.0][lisky-v0.3.0] onwards), and this blog post is for anyone interested in how that works, in particular anyone interested in contributing to the Lisky codebase - [pull requests welcome][lisky-contributing]!

What we’ll cover in this post:
1. What is BDD?
1. A tutorial-style step-by-step guide to writing your own tests using this approach.
1. What are the benefits and what are the disadvantages?

## What is BDD?

BDD stands for [behaviour-driven development][wiki-bdd]. When it comes to defining approaches to automated testing, sources can vary widely, but as understood here BDD incorporates ideas from [domain-driven design][wiki-ddd] (DDD) into a [test-driven development][wiki-tdd] (TDD) process.

So much has been written about these concepts elsewhere, so I won’t go into too much depth here. If any of these terms are new to you, don’t worry about it—the easiest way to understand how the approach works is just to work through the examples in the tutorial below.

In brief though: TDD is an approach to software development in which the developer first writes tests which define the desired behaviour, and then writes code which passes the tests. DDD is an approach which emphasises a consistent, implementation-neutral domain language. Thus the form of BDD we’ve adopted involves these three steps:
1. Writing an executable *specification* consisting of a series of steps described in implementation-neutral domain language
1. Writing test code which *implements* each such step atomically
1. Writing source code to *pass the tests* (and thus conform to the specification)

As with the [Gherkin][gherkin] language most often used for end-to-end testing, we divide specifications into 
- **Given** (for setting up test context), 
- **When** (for execution of the code under test), and 
- **Then** (for making assertions) steps.

## Tutorial

OK, let’s try writing tests for a function that takes a name and a language and wishes that person happy birthday in the selected language. There’s a [companion repo][companion-repo] with all the code described in this blogpost in case you get lost at any point. The commit history matches the progression outlined here, so you can step back to exactly the point you need.

### Setup

I’ll assume you have Node and NPM installed and are comfortable using the command line. I’m using Node v8.9.0 and NPM v5.5.1, so if you run into difficulties below check if using those exact versions helps. The code below is written in ES6, so I’m assuming you’re comfortable with that already.

Create a directory and navigate inside it:

```sh
$ mkdir lisky-bdd-tutorial
$ cd lisky-bdd-tutorial
```

You’ll need Mocha installed to run the tests:

```sh
$ npm install mocha
```

No need to use the `--save` or `--save-dev` options, once installed we can run Mocha directly using [npx][npx].

Finally we need some files to store our code:

```sh
$ touch specification.js given.js when.js then.js source.js
```

In the code blocks below I’ll put the name of the file being edited in a comment at the top, and indicate when I’m eliding code with a `// ...` comment.

### Happy path

We’ll use an [outside-in approach][wiki-outside-in] approach considering the [happy path][wiki-happy-path] first. Of course, you may find an inside-out approach suits you better, but outside-in works especially well with BDD.

Addressing the happy path, we start by specifying what should happen if everything goes according to plan:

```js
// specification.js

const then = require('./then');

describe('wishHappyBirthday', () => {
	it('Then it should return "Happy birthday, Lisky!"', then.itShouldReturn);
});
```

Now running Mocha on the specification should show us a pending test because `then.itShouldReturn` is undefined:

```mocha
$ npx mocha specification.js

	wishHappyBirthday
		- Then it should return "Happy birthday, Lisky!"

	0 passing (2ms)
	1 pending
```

We need a step definition!

```js
// then.js

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
```

What’s happening here?

1. We’re exporting a function from `then.js` for the specification to refer to.
1. That function asserts that the return value is equal to some expected value (simply doing what the function name implies).
1. The return value is destructured out of the test context (this is just a feature of Mocha).
1. The expected value is extracted out of the test title using a regular expression.

The last point here allows us to introduce specific examples of certain values in our specification, which are then used directly in our tests, so it’s easy to see whether a specification is working with realistic values, and we don’t have to worry about keeping redundant definitions synchronised with each other. It also means this step is ready for reuse in a different test with a different string value.

Now we have a failing test:

```mocha
wishHappyBirthday
	1) Then it should return "Happy birthday, Lisky!"

0 passing (4ms)
1 failing

1) wishHappyBirthday
	Then it should return "Happy birthday, Lisky!":

AssertionError [ERR_ASSERTION]: undefined === 'Happy birthday, Lisky!'
	at Context.itShouldReturn (then.js:8:16)
```

Of course `returnValue` is undefined, because we haven’t defined it yet. We need to develop our specification:

```js
// specification.js

const when = require('./when');
const then = require('./then');

describe('wishHappyBirthday', () => {
	describe('When wishHappyBirthday is called with the name and the language', () => {
		beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
		it('Then it should return "Happy birthday, Lisky!"', then.itShouldReturn);
	});
});
```

And the corresponding step definition:

```js
// when.js

const wishHappyBirthday = require('./source');

function wishHappyBirthdayIsCalledWithTheNameAndTheLanguage() {
	const { name, language } = this.test.ctx;
	this.test.ctx.returnValue = wishHappyBirthday(name, language);
}

module.exports = {
	wishHappyBirthdayIsCalledWithTheNameAndTheLanguage,
};
```

Here we store the return value in the test context so the **Then** step can access it later. The test fails: `TypeError: wishHappyBirthday is not a function`. `name` and `language` will obviously have to be dealt with at some point, but right now we need a source code function!

```js
// source.js

const wishHappyBirthday = () => 'Happy birthday, Lisky!';

module.exports = wishHappyBirthday;
```

Our tests are passing:

```mocha
wishHappyBirthday
	When wishHappyBirthday is called with the name and the language
		✓ Then it should return "Happy birthday, Lisky!"

1 passing (4ms)
```

But this function is terrible, it gives the same output regardless of name or language. We need a richer specification:


```js
// specification.js

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
```

And corresponding step definitions:

```js
// given.js

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
```

Here we reuse the `getFirstQuotedString` function we saw earlier to get the name/language from the test title and store it in the test context for later access. (You could store that function in a utils file if you wanted.) Note that because these functions are run in a `beforeEach` hook, we have to use the title from the test *parent*, not the test itself.

We’ve nested parts of the specification to cover both names in both languages (2x2 scenarios). Notice also that even though we added six totally new steps to the specification with a bunch of different variables, we only had to write two step definition functions. Now that’s what I call DRY!

We get three failures along the following lines:

```mocha
3) wishHappyBirthday
	Given a name "Satoshi"
		Given a language "Deutsch"
			When wishHappyBirthday is called with the name and the language
				Then it should return "Herzlichen Glückwunsch zum Geburtstag, Satoshi!":

AssertionError [ERR_ASSERTION]: 'Happy birthday, Lisky!' === 'Herzlichen Glückwunsch zum Geburtstag, Satoshi!'
	+ expected - actual

	-Happy birthday, Lisky!
	+Herzlichen Glückwunsch zum Geburtstag, Satoshi!

	at Context.itShouldReturn (then.js:8:16)
```

We have no choice but to improve our source code:

```js
// source.js

const wishHappyBirthday = (name, language) => {
	switch (language) {
		case 'English': return `Happy birthday, ${name}!`;
		case 'Deutsch': return `Herzlichen Glückwunsch zum Geburtstag, ${name}!`;
	}
};

module.exports = wishHappyBirthday;
```

And our tests pass!

```mocha
wishHappyBirthday
	Given a name "Lisky"
		Given a language "English"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Happy birthday, Lisky!"
		Given a language "Deutsch"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Herzlichen Glückwunsch zum Geburtstag, Lisky!"
	Given a name "Satoshi"
		Given a language "English"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Happy birthday, Satoshi!"
		Given a language "Deutsch"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Herzlichen Glückwunsch zum Geburtstag, Satoshi!"


4 passing (6ms)
```

### Unhappy paths

So much for the happy path, what about when things go wrong, such as if someone calls the function using a language we haven’t handled yet? Let’s update the specification first:

```js
// specification.js

// ...

describe('wishHappyBirthday', () => {
	describe('Given a name "Lisky"', () => {
		beforeEach(given.aName);
		// ...
		describe('Given an unsupported language "Esperanto"', () => {
			beforeEach(given.anUnknownLanguage);
			describe('When wishHappyBirthday is called with the name and the language', () => {
				beforeEach(when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage);
				it('Then it should throw an error "Unsupported language"', then.itShouldThrowAnError);
			});
		});
	});
	// ...
});
```

Then the step definitions:

```js
// given.js

// ...

const anUnknownLanguage = aLanguage;

module.exports = {
	// ...
	anUnknownLanguage,
}
```

```js
// then.js

// ...

function itShouldThrowAnError() {
	const { error } = this.test.ctx;
	const expectedMessage = getFirstQuotedString(this.test.title);
	return assert.strictEqual(error.message, expectedMessage);
}

module.exports = {
	//...
	itShouldThrowAnError,
}

```

The test doesn’t care if the language is known or not, so we can just alias `given.anUnknownLanguage` to the `given.aLanguage` step definition we already wrote. We do need to update our `when.wishHappyBirthdayIsCalledWithTheNameAndTheLanguage` step definition though, so that if an error is thrown it’s stored in the test context for later access:

```js
// when.js

// ...

function wishHappyBirthdayIsCalledWithTheNameAndTheLanguage() {
	const { name, language } = this.test.ctx;
	try {
		this.test.ctx.returnValue = wishHappyBirthday(name, language);
	} catch (error) {
		this.test.ctx.error = error;
	}
}

// ...
```

The test fails with `TypeError: Cannot read property 'message' of undefined` because our function doesn’t throw an error at all, let alone one with the right message. Time to update the source code:

```js
// source.js

const wishHappyBirthday = (name, language) => {
	switch (language) {
		case 'English': return `Happy birthday, ${name}!`;
		case 'Deutsch': return `Herzlichen Glückwunsch zum Geburtstag, ${name}!`;
		default: throw new Error('Unsupported language');
	}
};

// ...
```

And everything is passing:

```mocha
wishHappyBirthday
	Given a name "Lisky"
		Given a language "English"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Happy birthday, Lisky!"
		Given a language "Deutsch"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Herzlichen Glückwunsch zum Geburtstag, Lisky!"
		Given an unsupported language "Esperanto"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should throw an error "Unsupported language"
	Given a name "Satoshi"
		Given a language "English"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Happy birthday, Satoshi!"
		Given a language "Deutsch"
			When wishHappyBirthday is called with the name and the language
				✓ Then it should return "Herzlichen Glückwunsch zum Geburtstag, Satoshi!"


5 passing (5ms)
```

Obviously there’s a lot more you could do in terms of validation for this function (missing names, names with the wrong type etc), but we’ll leave this tutorial here.

## What are the benefits?

1. This approach enforces a consistent structure/style for your tests. Specifications have a reliable look and feel, and step definition functions end up being short and self-contained. No more spaghetti tests!
1. It results in atomic tests by default, so your test suite is less brittle.
1. Writing specifications with language abstracted from test implementation allows you to think about the exact functionality you want without getting distracted by thoughts about how you will test that functionality. This encourages stronger, more meaningful tests, which should ultimately result in more robust source code.
1. Once you’ve properly thought about what steps are required for some test, it’s usually trivial to write the actual test code.
1. It’s also easier for newcomers to the codebase to understand the tests you’ve written: instead of being forced to infer the meaning of a test from the implementation, a new developer simply reads English-like sentences which explain what’s happening in easily digestible chunks.
1. Since each step is defined in one place, this approach encourages reuse of existing steps, resulting in a more [DRY][wiki-dry] codebase. We removed (net) hundreds of lines of test code when switching from our old testing approach in Lisky.
1. Refactoring often poses problems for tests: they can break in a way that requires a lot of updates all over the place or in the most insidious cases they can lose meaning without you noticing. This approach makes refactoring test code much simpler - just make the change to the relevant step definition and all of the tests which include that step reflect the update.

## What are the disadvantages?

1. Writing good specifications is hard. Actually this is true of other testing approaches too, but it’s perhaps more immediately obvious when you’re doing BDD.
1. Sometimes it can be difficult to tell when you’ve already defined a step that you’re using in a new test. This can be mitigated by splitting your step definitions into modules so you can easily browse through a shortlist of potentially applicable step definitions before writing a new one.
1. It’s a little unconventional, so developers new to the approach may take a while getting used to it.

## Conclusion

This BDD approach to tests is relatively new to us, and we’re still getting used to working with it. As we get more comfortable we’re discovering more patterns, codebase management techniques, and better ways to approach creating steps. But we’ve already seen benefits in terms of clearer tests and a more concise test codebase.

I take it as a good sign that when it comes to writing tests in other projects which haven’t adopted this approach, it now feels frustratingly unstructured, almost as if it’s inviting you to write lazy tests.

If you’re interested in contributing to Lisky, we’d love to hear from you! We have some [contribution guidelines][lisky-contributing], and we ask pull requests to include full test coverage (using the BDD style described in this blog post). There are some divergences from the code used in this tutorial to note though:

- We’re using ES6 [imports][es6-import]/[exports][es6-export] in Lisky
- We’re using [should.js][should-js] as our assertion library

Happy testing!

## Further reading

- Konstantin Kudryashov on [Modelling by Example][kk-blogpost] (and a [video][kk-video])
- [Testing README][lisky-test-readme] in the Lisky project

[companion-repo]: https://github.com/willclarktech/lisky-bdd-tutorial
[es6-export]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
[es6-import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[gherkin]: https://github.com/cucumber/cucumber/wiki/Gherkin
[kk-blogpost]: http://stakeholderwhisperer.com/posts/2014/10/introducing-modelling-by-example
[kk-video]: https://vimeo.com/149564297
[lisk-core]: https://github.com/LiskHQ/lisk
[lisky]: https://github.com/LiskHQ/lisky
[lisky-contributing]: https://github.com/LiskHQ/lisky/blob/0.3.0/CONTRIBUTING.md
[lisky-test-readme]: https://github.com/LiskHQ/lisky/blob/0.3.0/test/README.md
[lisky-v0.3.0]: https://github.com/LiskHQ/lisky/tree/0.3.0
[npx]: https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b
[should-js]: https://shouldjs.github.io/
[wiki-bdd]: https://en.wikipedia.org/wiki/Behavior-driven_development
[wiki-ddd]: https://en.wikipedia.org/wiki/Domain-driven_design
[wiki-dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[wiki-happy-path]: https://en.wikipedia.org/wiki/Happy_path
[wiki-outside-in]: https://en.wikipedia.org/wiki/Outside%E2%80%93in_software_development
[wiki-tdd]: https://en.wikipedia.org/wiki/Test-driven_development
