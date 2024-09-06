# Chat node

Este é um projeto de estudo e teste de serviços WebSocket utilizando **Express**, **Socket.IO**, **SQLite** e **Cluster Adapter**.

## Descrição

Este projeto é uma Prova de Conceito (PoC) para explorar e entender a implementação de WebSockets em um ambiente de servidor Node.js, com múltiplos núcleos (cluster) e recuperação de estado de conexão. Ele inclui:

- Servidor Express que lida com múltiplas conexões de WebSocket.
- Armazenamento de mensagens usando banco de dados SQLite.
- Implementação de um cluster de múltiplos processos para otimizar o uso de CPU.

## Requisitos

- Node.js
- SQLite

## Instalação

1. Clone este repositório.
2. Execute `npm install` para instalar as dependências.
3. Inicie o servidor com `npm start` ou configure conforme a sua necessidade.

## Uso

1. Acesse `http://localhost:3000` para abrir a página de chat.
2. Envie mensagens que serão armazenadas no banco de dados SQLite.
3. As mensagens serão recuperadas no caso de perda de conexão.

## Tecnologias Utilizadas

- **Express**: Para criar o servidor HTTP.
- **Socket.IO**: Para a comunicação em tempo real com WebSockets.
- **SQLite**: Banco de dados relacional para armazenar as mensagens.
- **Cluster Adapter**: Para gerenciar múltiplos processos e distribuir a carga entre os núcleos da CPU.

## Observações

Este projeto foi desenvolvido em um ambiente acadêmico e pode apresentar bugs e comportamentos inesperados. Ele é um material de estudo criado para explorar e testar a viabilidade de WebSockets com recuperação de estado em ambientes de cluster.
