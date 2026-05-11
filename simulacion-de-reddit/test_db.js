const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function test() {
  try {
    const dbPath = path.resolve(__dirname, 'reddit_sim.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log(await db.get('SELECT * FROM posts LIMIT 1'));
    console.log("DB connection successful");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
