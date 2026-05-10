import { getDb } from './db';
import { CommentData } from '../components/Comment';

/**
 * Obtiene todos los comentarios de un post y los organiza en una estructura de árbol (recursiva).
 * Utiliza una CTE recursiva en SQLite de forma asíncrona.
 */
export const getCommentsByPostId = async (postId: number): Promise<CommentData[]> => {
  const db = await getDb();

  // La consulta asíncrona utiliza db.all
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

  const commentMap = new Map<number, CommentData>();
  const rootComments: CommentData[] = [];

  flatComments.forEach((row: any) => {
    const comment: CommentData = {
      id: row.id,
      post_id: row.post_id,
      parent_id: row.parent_id,
      content: row.content,
      author: row.author,
      upvotes: row.upvotes,
      created_at: row.created_at,
      replies: [],
    };
    commentMap.set(comment.id, comment);
  });

  flatComments.forEach((row: any) => {
    const comment = commentMap.get(row.id)!;
    
    if (row.parent_id === null) {
      rootComments.push(comment);
    } else {
      const parent = commentMap.get(row.parent_id);
      if (parent && parent.replies) {
        parent.replies.push(comment);
      }
    }
  });

  return rootComments;
};
