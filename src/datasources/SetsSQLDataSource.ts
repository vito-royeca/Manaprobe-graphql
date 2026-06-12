import { BatchedSQLDataSource, BatchedSQLDataSourceProps } from "@nic-jennings/sql-datasource";

import { MGSectionedSets, MGSet, MGSets, SetByIDInput } from "../types";
import { SetsUtilities } from "./SetsUtilities";

export class SetsSQLDataSource extends BatchedSQLDataSource {
    utilities = new SetsUtilities();

    constructor(config: BatchedSQLDataSourceProps) {
        super(config);
    }

    async set(input: SetByIDInput): Promise<MGSet> {
        try {
            const utilities = new SetsUtilities();

            if (input.sortedBy === "name" && input.orderBy === "asc") {
                const fromClause = `matv_cmset_${input.setID}_${input.languageID}`;
                const data = await this.db.query
                    .select("*")
                    .from(fromClause)
                    .cache(10);
                return utilities.set(data, input.languageID);
            } else {
                const params = [input.setID, input.languageID, input.sortedBy || "name", input.orderBy || "asc"];
                const sql = "select * from selectSet(?,?,?,?)";
                const data = await this.db.query
                    .raw(sql, params)
                const setsData = data.rows && data.rows.length >= 1 ? data.rows[0] : undefined;

                if (setsData === undefined) {
                    throw new Error(`Set with ID ${input.setID} not found`);
                }
                return utilities.set(setsData, input.languageID);
            }
        } catch (error) {
            console.error("Error executing raw SQL query: ", error);
            throw error;
        }
    }

    async sets(): Promise<MGSets> {
        const data = await this.db.query
            .select("*")
            .from("matv_cmsets")
            .cache(10);

        return this.utilities.sets(data);
    }

    async setsByName(): Promise<MGSectionedSets> {
        const sets = (await this.sets()).sets;

        return this.utilities.setsByName(sets);
    }

    async setsByType(): Promise<MGSectionedSets> {
        const sets = (await this.sets()).sets;

        return this.utilities.setsByType(sets);
    }

    async setsByYear(): Promise<MGSectionedSets> {
        const sets = (await this.sets()).sets;

        return this.utilities.setsByYear(sets);
    }
}