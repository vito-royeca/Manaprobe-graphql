import { BatchedSQLDataSource, BatchedSQLDataSourceProps } from "@nic-jennings/sql-datasource";

import { MGCard, MGCards } from "../types";
import { CardsUtilities } from "./CardsUtilities";

export class CardsSQLDataSource extends BatchedSQLDataSource {
    utilities = new CardsUtilities();

    constructor(config: BatchedSQLDataSourceProps) {
        super(config);
    }

    async card(id: string): Promise<MGCard> {
        try {
            const params = [id];
            const sql = "select * from selectCard(?)";
            const data = await this.db.query
                .raw(sql, params)
            const rows = data.rows && data.rows.length >= 1 ? data.rows[0] : undefined;

            if (rows === undefined) {
                throw new Error(`Card with ID ${id} not found`);
            }
            return this.utilities.card(rows);
        } catch (error) {
            console.error("Error executing raw SQL query: ", error);
            throw error;
        }
    }

    async cardPrintings(id: string, languageID: string): Promise<MGCards> {
        try {
            const params = [id, languageID, "set_release", "desc"];
            const sql = "SELECT * from selectPrintings(?,?,?,?)";
            const data = await this.db.query
                .raw(sql, params)
            const rows = data.rows;

            if (rows === undefined) {
                throw new Error(`Card with ID ${id} not found`);
            }
            return this.utilities.cardArray(rows);
        } catch (error) {
            console.error("Error executing raw SQL query: ", error);
            throw error;
        }
    }

    async cardsByIDs(ids: string[]): Promise<MGCards> {
        try {
            const idsString = `'{${ids.map(id => `''${id}''`).join(",")}}'`;
            const params = ["name", "asc"];
            const sql = `SELECT * from selectCardsByID(${idsString},?,?)`;
            const data = await this.db.query
                .raw(sql, params)
            const rows = data.rows;

            if (rows === undefined) {
                throw new Error(`Cards with IDs ${ids} not found`);
            }
            return this.utilities.cardArray(rows);
        } catch (error) {
            console.error("Error executing raw SQL query: ", error);
            throw error;
        }
    }
}