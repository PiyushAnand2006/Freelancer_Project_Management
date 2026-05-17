import "reflect-metadata";
import { DataSource } from 'typeorm';
import * as entities from './entities.ts';

export const AppDataSource = new DataSource({
    type: "oracle",
    connectString: process.env.ORACLE_CONNECTION_STRING,
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    synchronize: true,
    logging: false,
    entities: Object.values(entities).filter(e => typeof e === 'function'),
    extra: {
      // Oracle specific options
    }
});

// For compatibility with controllers that expect 'db'
export const db = AppDataSource;

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Oracle Data Source has been initialized!");
  }
}
