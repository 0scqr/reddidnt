const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function test() {
  try {
    const dbPath = path.resolve(__dirname, 'reddit_sim.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    
    const postId = 3; // From previous output
    const flatComments = await db.all(`
    WITH RECURSIVE CommentTree AS (
      SELECT 
        id, post_id, parent_id, content, author, upvotes, created_at, 0 AS level
      FROM comments
      WHERE post_id = ? AND parent_id IS NULL
      
      UNION ALL
      
      SELECT 
        c.id, c.post_id, c.parent_id, c.content, c.author, c.upvotes, c.created_at, ct.level + 1
      FROM comments c
      INNER JOIN CommentTree ct ON c.parent_id = ct.id
    )
    SELECT * FROM CommentTree
    ORDER BY level ASC, created_at ASC;
  `, [postId]);

    console.log("Flat comments size:", flatComments.length);
    console.log("Flat comments:", flatComments.map(c => ({id: c.id, parent_id: c.parent_id})));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
