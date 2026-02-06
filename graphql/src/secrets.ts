export default async () => {
  const DB_USER = process.env.DB_USER || undefined;
  const DB_PASS = process.env.DB_PASS || undefined;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || undefined;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || undefined;
  const JWT_SECRET = process.env.JWT_SECRET || undefined;

  return {
    DB_USER,
    DB_PASS,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    JWT_SECRET,
  };
};
