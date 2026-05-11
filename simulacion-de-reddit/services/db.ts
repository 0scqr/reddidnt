import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

// Creamos la instancia de sql solo si tenemos la URL
const sql = connectionString 
  ? postgres(connectionString, { 
      ssl: 'require',
      connect_timeout: 10, // 10 segundos de timeout para evitar que se quede "pegado"
    }) 
  : null;

export const getDb = async () => {
  if (!sql) {
    throw new Error("DATABASE_URL no está configurada en las variables de entorno.");
  }

  return {
    get: async (query: string, params: any[] = []) => {
      try {
        const rows = await sql.unsafe(query.replace(/\?/g, (match, offset) => {
          return '$' + (query.substring(0, offset).split('?').length);
        }), params);
        return rows[0];
      } catch (err) {
        console.error("Error en DB (get):", err);
        throw err;
      }
    },
    all: async (query: string, params: any[] = []) => {
      try {
        const rows = await sql.unsafe(query.replace(/\?/g, (match, offset) => {
          return '$' + (query.substring(0, offset).split('?').length);
        }), params);
        return rows;
      } catch (err) {
        console.error("Error en DB (all):", err);
        throw err;
      }
    },
    run: async (query: string, params: any[] = []) => {
      try {
        const rows = await sql.unsafe(query.replace(/\?/g, (match, offset) => {
          return '$' + (query.substring(0, offset).split('?').length);
        }), params);
        return {
          lastID: (rows[0] as any)?.id || null,
          rowsAffected: rows.length
        };
      } catch (err) {
        console.error("Error en DB (run):", err);
        throw err;
      }
    },
    exec: async (query: string) => {
      try {
        await sql.unsafe(query);
      } catch (err) {
        console.error("Error en DB (exec):", err);
        throw err;
      }
    }
  };
};

export const initDb = async () => {
  if (!sql) return;
  try {
    // Verificamos si las tablas existen antes de intentar crearlas
    // (Postgres soporta IF NOT EXISTS pero esto es más seguro para debug)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        author TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
        target_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, target_type, target_id)
      );
    `;
    console.log("Tablas inicializadas correctamente.");
  } catch (error) {
    console.error("Error inicializando tablas:", error);
    throw error;
  }
};
