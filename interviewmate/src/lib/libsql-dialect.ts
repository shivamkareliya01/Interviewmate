import * as kysely from "kysely";

export class LibsqlDialect {
    #config;
    constructor(config: { client: any }) {
        this.#config = config;
    }
    createAdapter() {
        return new kysely.SqliteAdapter();
    }
    createDriver() {
        let client;
        let closeClient;
        if ("client" in this.#config) {
            client = this.#config.client;
            closeClient = false;
        } else {
            throw new Error("Please specify `client` in the LibsqlDialect config");
        }
        return new LibsqlDriver(client, closeClient);
    }
    createIntrospector(db: any) {
        return new kysely.SqliteIntrospector(db);
    }
    createQueryCompiler() {
        return new kysely.SqliteQueryCompiler();
    }
}

export class LibsqlDriver {
    client: any;
    #closeClient: boolean;
    constructor(client: any, closeClient: boolean) {
        this.client = client;
        this.#closeClient = closeClient;
    }
    async init() { }
    async acquireConnection() {
        return new LibsqlConnection(this.client);
    }
    async beginTransaction(connection: any, _settings: any) {
        await connection.beginTransaction();
    }
    async commitTransaction(connection: any) {
        await connection.commitTransaction();
    }
    async rollbackTransaction(connection: any) {
        await connection.rollbackTransaction();
    }
    async releaseConnection(_conn: any) { }
    async destroy() {
        if (this.#closeClient) {
            this.client.close();
        }
    }
}

export class LibsqlConnection {
    client: any;
    #transaction: any;
    constructor(client: any) {
        this.client = client;
    }
    async executeQuery(compiledQuery: any) {
        const target = this.#transaction ?? this.client;
        const result = await target.execute({
            sql: compiledQuery.sql,
            args: compiledQuery.parameters,
        });
        return {
            insertId: result.lastInsertRowid,
            numAffectedRows: BigInt(result.rowsAffected),
            rows: result.rows,
        };
    }
    async beginTransaction() {
        if (this.#transaction) {
            throw new Error("Transaction already in progress");
        }
        this.#transaction = await this.client.transaction();
    }
    async commitTransaction() {
        if (!this.#transaction) {
            throw new Error("No transaction to commit");
        }
        await this.#transaction.commit();
        this.#transaction = undefined;
    }
    async rollbackTransaction() {
        if (!this.#transaction) {
            throw new Error("No transaction to rollback");
        }
        await this.#transaction.rollback();
        this.#transaction = undefined;
    }
    async *streamQuery(_compiledQuery: any, _chunkSize: any) {
        throw new Error("Libsql Driver does not support streaming yet");
    }
}
