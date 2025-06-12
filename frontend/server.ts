import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// Definir una interfaz para los parámetros
interface RenderWithTimeoutParams {
  commonEngine: CommonEngine;
  bootstrap: any; // Cambia 'any' por el tipo correcto si lo conoces
  documentFilePath: string;
  url: string;
  publicPath: string;
  providers: any[]; // Cambia 'any[]' por el tipo correcto si lo conoces
  timeoutDuration?: number; // Por defecto 30 segundos
}

// Función para manejar el tiempo de espera durante la renderización
function renderWithTimeout({
  commonEngine,
  bootstrap,
  documentFilePath,
  url,
  publicPath,
  providers,
  timeoutDuration = 70000 // Por defecto 30 segundos
}: RenderWithTimeoutParams): Promise<string> { // El tipo de retorno es una Promesa que resuelve a un string (HTML)
  return new Promise((resolve, reject) => {
    // Creamos un temporizador para forzar el timeout si tarda demasiado
    const timeout = setTimeout(() => {
      reject(new Error('SSR Timeout: La renderización del servidor ha superado el límite de tiempo'));
    }, timeoutDuration);

    // Intentamos hacer el render con Angular Universal
    commonEngine
      .render({
        bootstrap,
        documentFilePath,
        url,
        publicPath,
        providers
      })
      .then((html) => {
        clearTimeout(timeout); // Limpiamos el timeout si la renderización fue exitosa
        resolve(html);
      })
      .catch((error) => {
        clearTimeout(timeout); // Limpiamos el timeout en caso de error
        reject(error);
      });
  });
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
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
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Usamos la función renderWithTimeout en lugar de commonEngine.render
    renderWithTimeout({
      commonEngine,
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      timeoutDuration: 60000 // 60 segundos
    })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();

