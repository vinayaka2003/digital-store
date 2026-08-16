import { neon, Pool } from "@neondatabase/serverless";

let sqlInstance = null;

export const sql = (strings, ...values) => {
  if (!sqlInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is missing!");
    }
    sqlInstance = neon(process.env.DATABASE_URL);
  }
  return sqlInstance(strings, ...values);
};

export { Pool };
