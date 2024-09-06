import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';

//VERIFICA SE O PROCESSO É O PRIMÁRIO
if (cluster.isPrimary) {  

  //PEGA O NÚMERO DE NÚCLEOS DA CPU
  const numCPUs = availableParallelism();
  //CRIA UM WORKER PARA CADA NÚCLEO
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }

  //CONFIGURA O PRIMÁRIO PARA O ADAPTER DE CLUSTER
  setupPrimary();
} else {
  //ABRE E CONECTA AO BANCO DE DADOS SQLITE
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  //CRIA A TABELA DE MENSAGENS SE NÃO EXISTIR
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
    );
  `);

  //CONFIGURA O SERVIDOR EXPRESS
  const app = express();
  const server = createServer(app);

  //CONFIGURA O SOCKET.IO COM RECUPERAÇÃO DE ESTADO
  const io = new Server(server, {
    connectionStateRecovery: {},
    adapter: createAdapter()
  });

  //DETERMINA O CAMINHO DO DIRETÓRIO ATUAL
  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  //GERENCIA AS CONEXÕES DE SOCKET.IO
  io.on('connection', async (socket) => {

    //LIDA COM A MENSAGEM DE CHAT ENVIADA PELO CLIENTE
    socket.on('chat message', async (msg, clientOffset, callback) => {
      let result;
      try {
        result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
      } catch (e) {
        if (e.errno === 19) {
          callback();
        } else {
          return;
        }
      }

      //EMITE A MENSAGEM PARA TODOS OS CLIENTES CONECTADOS
      io.emit('chat message', msg, result.lastID);
      callback();
    });

    //RECUPERA AS MENSAGENS DO BANCO DE DADOS CASO O SOCKET NÃO ESTEJA RECUPERADO
    if (!socket.recovered) {
      try {
        await db.each('SELECT id, content FROM messages WHERE id > ?',
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit('chat message', row.content, row.id);
          }
        )
      } catch (e) {}
    }
  });

  //OBTÉM A PORTA DO PROCESSO
  const port = process.env.PORT;

  //INICIA O SERVIDOR NA PORTA CONFIGURADA
  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
}
