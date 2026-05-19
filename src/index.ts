import { expressMiddleware } from "@as-integrations/express5";

import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default';
import { startStandaloneServer } from "@apollo/server/standalone";

import { ApolloServer } from "@apollo/server";
import dotenv from "dotenv";

import { gql } from "graphql-tag";
import path from "node:path";
import { readFileSync } from "node:fs";
import cors from 'cors';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';

import { CardsSQLDataSource } from "./datasources/CardsSQLDataSource";
import { CardsRESTDataSource } from "./datasources/CardsRESTDataSource";
import { FeedsDataSource } from "./datasources/FeedsDataSource";
import { resolvers } from "./resolvers";
import { SetsRESTDataSource } from "./datasources/SetsRESTDataSource";
import { SetsSQLDataSource } from "./datasources/SetsSQLDataSource";

dotenv.config();

const APOLLO_SERVER_PORT = 4000;
const HTTPS_SERVER_PORT = 3443;
let apolloServer: ApolloServer;

function createDataSources(cache: any) {
    if (process.env.DATASOURCE_TYPE === "SQL") {
        const knexConfig = {
            client: "pg",
            // postgres://[user]:[password]@[host]:[port]/[database]
            connection: process.env.PG_CONNECTION_STRING,
            pool: {
                maxConnectionLifetimeMillis: 5 * 60_000, // 5 minutes
                maxConnectionLifetimeJitterMillis: 60_000, // up to +1 minute random
                min: 0,
                max: 7,
            },
        };
        return {
            dataSources: {
                cardsDataSource: new CardsSQLDataSource({ knexConfig, cache }),
                feedsDataSource: new FeedsDataSource(),
                setsDataSource: new SetsSQLDataSource({ knexConfig, cache }),
            },
        };
    } else {
        return {
            dataSources: {
                cardsDataSource: new CardsRESTDataSource({ cache }),
                feedsDataSource: new FeedsDataSource(),
                setsDataSource: new SetsRESTDataSource({ cache }),
            },
        };
    }
}

async function startApolloServer() {
    const typeDefs = gql(
        readFileSync(path.resolve(__dirname, "./graphql/schema.graphql"), {
            encoding: "utf-8",
        })
    );

    apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== "production",
        plugins: [
            // Install a landing page plugin based on NODE_ENV
            process.env.NODE_ENV === 'production'
                ? ApolloServerPluginLandingPageProductionDefault({
                    graphRef: 'my-graph-id@my-graph-variant',
                    footer: true,
                })
                : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
        ],
    });

    const { url } = await startStandaloneServer(apolloServer, {
        context: async () => {
            const { cache } = apolloServer;
            const dataSources = createDataSources(cache).dataSources;

            return {
                dataSources
            };
        },
        listen: { port: APOLLO_SERVER_PORT },
    });

    console.log('🚀 Apollo Server ready at', `http://${process.env.HOSTNAME}:${APOLLO_SERVER_PORT}/graphql`);
}

async function startExpressServer() {
    const configurations = {
        production: {
            ssl: true,
            hostname: process.env.HOSTNAME
        },
        development: {
            ssl: false,
            hostname: process.env.HOSTNAME
        },
    };
    const environment = process.env.NODE_ENV || 'development';
    const config = configurations[environment as keyof typeof configurations];

    await startApolloServer();
    const app = express();
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        express.json(),
        expressMiddleware(apolloServer),
    );

    // Create the HTTPS or HTTP server, per configuration
    let httpServer;
    if (config.ssl) {
        // Assumes certificates are in a .ssl folder off of the package root.
        // Make sure these files are secured.
        httpServer = https.createServer(
            {
                key: fs.readFileSync('./ssl/manaprobe_com.key'),
                cert: fs.readFileSync('./ssl/manaprobe_com.crt'),
            },
            app,
        );
    } else {
        httpServer = http.createServer(app);
    }

    await new Promise<void>((resolve) => httpServer.listen({
        port: HTTPS_SERVER_PORT
    }, resolve));

    console.log('🚀 Web Server ready at', `http${config.ssl ? 's' : ''}://${config.hostname}:${HTTPS_SERVER_PORT}/graphql`);
}

startApolloServer();
// startExpressServer();
