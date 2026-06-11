import { CardsRESTDataSource } from "./datasources/CardsRESTDataSource";
import { CardsSQLDataSource } from "./datasources/CardsSQLDataSource";
import { FeedsDataSource } from "./datasources/FeedsDataSource";
import { SearchRESTDataSource } from "./datasources/SearchRESTDataSource";
import { SetsRESTDataSource } from "./datasources/SetsRESTDataSource";
import { SetsSQLDataSource } from "./datasources/SetsSQLDataSource";

export type RESTDataSourceContext = {
    dataSources: {
        cardsDataSource: CardsRESTDataSource;
        feedsDataSource: FeedsDataSource;
        searchDataSource: SearchRESTDataSource;
        setsDataSource: SetsRESTDataSource;
    };
};

export type SQLDataSourceContext = {
    dataSources: {
        cardsDataSource: CardsSQLDataSource;
        feedsDataSource: FeedsDataSource;
        setsDataSource: SetsSQLDataSource;
    };
};