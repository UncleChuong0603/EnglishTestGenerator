export function assertTestDatabase(connectionString: string): Promise<{
  database: string;
  username: string;
  address: string;
  port: number;
}>;
