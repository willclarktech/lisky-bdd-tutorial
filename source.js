const wishHappyBirthday = (name, language) => {
	switch (language) {
		case 'English': return `Happy birthday, ${name}!`;
		case 'Deutsch': return `Herzlichen Glückwunsch zum Geburtstag, ${name}!`;
	}	
};

module.exports = wishHappyBirthday;
