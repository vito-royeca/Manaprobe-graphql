import { BatchedSQLDataSource, BatchedSQLDataSourceProps } from "@nic-jennings/sql-datasource";

import { MGCard, MGCards } from "../types";
import { CardsUtilities } from "./CardsUtilities";

export class SearchSQLDataSource extends BatchedSQLDataSource {
    utilities = new CardsUtilities();

    constructor(config: BatchedSQLDataSourceProps) {
        super(config);
    }

    async search(query: string): Promise<MGCards> {
        try {
            const params = [query, "name", "asc"];
            const sql = "SELECT * from searchCards($1,$2,$3)";
            const data = await this.db.query
                .raw(sql, params)
            const rows = data.rows;

            if (rows === undefined) {
                throw new Error(`No cards found for query: ${query}`);
            }
            return this.utilities.cardArray(rows);
        } catch (error) {
            console.error("Error executing raw SQL query:", error);
            throw error;
        }
    }
}