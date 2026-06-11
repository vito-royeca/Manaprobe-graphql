import { RESTDataSource } from "@apollo/datasource-rest";

import { MGCard, MGCards } from "../types";
import { CardsUtilities } from "./CardsUtilities";

export class SearchRESTDataSource extends RESTDataSource {
    baseURL = "https://managuideapp.com/";
    utilities = new CardsUtilities();

    async search(query: string): Promise<MGCard[]> {
        const data = await this.get<MGCard[]>(`search/${query}?json=true`);

        return this.utilities.search(data);
    }    
}