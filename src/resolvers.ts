import { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: {
    // Set
    set: (_, { input }, { dataSources }) => {
      if (!input) {
          throw new Error("input is required");
      }
      return dataSources.setsDataSource.set(input);
    },

    // Sets
    sets: (_, __, { dataSources }) => {
      return dataSources.setsDataSource.sets();
    },
    setsByName: (_, __, { dataSources }) => {
      return dataSources.setsDataSource.setsByName();
    },
    setsByType: (_, __, { dataSources }) => {
      return dataSources.setsDataSource.setsByType();
    },
    setsByYear: (_, __, { dataSources }) => {
      return dataSources.setsDataSource.setsByYear();
    },
    
    // Cards
    card: (_, { id }, { dataSources }) => {
      return dataSources.cardsDataSource.card(id);
    },

    cardPrintings: (_, { id, languageID }, { dataSources }) => {
      return dataSources.cardsDataSource.cardPrintings(id, languageID);
    },

    cardsByIDs: (_, { ids }, { dataSources }) => {
      return dataSources.cardsDataSource.cardsByIDs(ids);
    },

    // Search
    search: (_, { query }, { dataSources }) => {
      return dataSources.searchDataSource.search(query);
    },

    // Feeds
    feeds: (_, __, { dataSources }) => {
      return dataSources.feedsDataSource.feeds();
    },
  }
};