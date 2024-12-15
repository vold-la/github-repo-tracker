import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './config/database';
import { typeDefs } from './graphql/schema/typeDefs';
import { createResolvers } from './graphql/resolvers';
import { GitHubService } from './services/GitHubService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const githubService = new GitHubService(AppDataSource);

    const server = new ApolloServer({
      typeDefs,
      resolvers: createResolvers(AppDataSource, githubService),
    });

    await server.start();

    app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(server));

    app.get('/health', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });

    const PORT = process.env.PORT || 4000;
    await new Promise<void>(resolve => {
      httpServer.listen({ port: PORT }, resolve);
    });

    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
