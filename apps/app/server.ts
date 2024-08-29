import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { AppModule } from '@api/root';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export async function app(): Promise<express.Express> {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    })
  );

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    if (req.url.startsWith('/api')) {
      // handle API routes separately
      next();
    } else {
      commonEngine
        .render({
          bootstrap,
          documentFilePath: indexHtml,
          url: `${protocol}://${headers.host}${originalUrl}`,
          publicPath: browserDistFolder,
          providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
        })
        .then(html => res.send(html))
        .catch(err => next(err));
    }
  });

  // Setup NestJS app
  const adapter = new ExpressAdapter(server);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  await app.init();

  return server;
}

async function run(): Promise<void> {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = await app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
