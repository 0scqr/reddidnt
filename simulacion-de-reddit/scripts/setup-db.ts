import { initDb } from '../services/db';

async function main() {
  console.log("Iniciando creación de tablas en Vercel Postgres...");
  await initDb();
  console.log("Proceso finalizado.");
  process.exit(0);
}

main().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
