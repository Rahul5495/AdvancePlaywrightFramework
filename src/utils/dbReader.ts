import * as path from 'node:path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import type { LoginRow } from './yamlReader';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * MySQL is async, so data can only arrive inside a hook/test,
 * not at test-collection time. See 71_DDT_MySQL.spec.ts.
 *
 * Config comes from the project .env file or the process environment:
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */
function getDbConfig(): ConnectionOptions | undefined {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE } = process.env;
    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
        return undefined;
    }

    const port = Number(process.env.MYSQL_PORT ?? 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('MYSQL_PORT must be an integer between 1 and 65535');
    }

    return {
        host: MYSQL_HOST,
        port,
        user: MYSQL_USER,
        password: process.env.MYSQL_PASSWORD ?? '',
        database: MYSQL_DATABASE,
    };
}

/** True only when all required connection settings are present. */
export function isDbConfigured(): boolean {
    return getDbConfig() !== undefined;
}

/** Values MySQL can bind to a `?` placeholder. */
export type SqlParam = string | number | boolean | Date | null;

/** Runs a SELECT and returns typed result rows. */
export async function query<T extends RowDataPacket = RowDataPacket>(
    sql: string,
    params: SqlParam[] = []
): Promise<T[]> {
    const config = getDbConfig();
    if (!config) {
        throw new Error('MySQL is not configured; set MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE');
    }

    const connection = await mysql.createConnection(config);
    try {
        const [rows] = await connection.execute<T[]>(sql, params);
        return rows;
    } finally {
        await connection.end();
    }
}

interface LoginDataRecord extends RowDataPacket {
    description: string;
    username: string;
    password: string;
    should_pass: number;
    expected_error: string;
}

/** Reads login_data and maps snake_case columns to the shared LoginRow shape. */
export async function readLoginDataFromDB(): Promise<LoginRow[]> {
    const rows = await query<LoginDataRecord>(
        'SELECT description, username, password, should_pass, expected_error ' +
        'FROM login_data WHERE is_active = ? ORDER BY id',
        [1]
    );

    return rows.map((r) => ({
        description: r.description,
        username: r.username,
        password: r.password,
        shouldPass: Number(r.should_pass) === 1,
        expectedError: r.expected_error,
    }));
}