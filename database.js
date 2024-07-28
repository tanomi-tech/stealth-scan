const sqlite3 = require('sqlite3');

const dbName = process.env.SS_DB_NAME + '.db';
let db = new sqlite3.Database(`./${dbName}`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
	if (err && err.code == "SQLITE_CANTOPEN") {
		createDatabase();
		return;
	} else if (err) {
		console.log("Getting error " + err);
		exit(1);
	}
});

function createDatabase() {
	const newdb = new sqlite3.Database(`./${dbName}`, (err) => {
		if (err) {
			console.log("Getting error " + err);
			exit(1);
		}
		createTables(newdb);
	});
}
  
function createTables(newdb) {
	newdb.exec(`
		create table reports (
			host text not null,
			domain text not null,
			error text,
			message text,
			owner__name text,
			owner__displayName text,
			owner__privacyPolicy text,
			owner__url text,
			fingerprinting
		);
	`, ()  => {
		testQueries(newdb);
	});
}

function testQueries(db) {
	db.all(`select * from reports`, (err, rows) => {
		console.log('Queries resolved');
	});
}

module.exports = db;