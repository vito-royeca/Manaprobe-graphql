import { RESTDataSource } from "@apollo/datasource-rest";

import { MGCard, MGCards } from "../types";
import { CardsUtilities } from "./CardsUtilities";

export class SearchRESTDataSource extends RESTDataSource {
    baseURL = "https://managuideapp.com/";
    utilities = new CardsUtilities();

    async search(query: string): Promise<MGCards> {
        const data = await this.get<MGCard[]>(`search?query=${query}&json=true`);

        return this.utilities.cardArray(data);
    }    
}