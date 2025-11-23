# 🚚 ROTAS INTELIGENTES – Sistema de Controle de Viagens para Logística

Aplicação web para cadastro de locais, criação de rotas e acompanhamento de viagens em tempo real para empresas de logística.  
Projeto desenvolvido como Trabalho de Conclusão de Curso. 🎓

---

## 🔍 1. Visão geral

O sistema permite que:

- 👨‍💼 **Administradores** cadastrem locais de clientes, gerenciem usuários (motoristas) e acompanhem todas as viagens em execução ou concluídas.
- 🚛 **Motoristas** criem viagens utilizando locais cadastrados, iniciem a rota e marquem a passagem por cada ponto, atualizando o status da viagem.

A aplicação é composta por:

- 🖥️ **Backend** em Java + Spring Boot (API REST + autenticação simples com sessão).
- 🌐 **Frontend** em Next.js/React, com integração ao **Google Maps JavaScript API + Places API** para:
  - Exibição de mapas
  - Autocomplete de endereço
  - Visualização das rotas

---

## ✅ 2. Funcionalidades principais

### 👨‍💼 Perfil Administrador

- 🔐 Login e logout.
- 📍 Cadastro, edição, desativação e reativação de **locais**.
- 📋 Listagem de locais (ativos e inativos).
- 👤 Cadastro de **motoristas**.
- 🧭 Criação de **viagens**, escolhendo:
  - Motorista responsável.
  - Nome da viagem.
  - Locais da rota (mínimo de 2).
- 📊 Visualização de todas as viagens:
  - Status (PLANEJADA, EM_ANDAMENTO, CONCLUIDA).
  - Datas de criação, início e fim.
  - Quantidade de pontos da rota.
- 🗺️ Visualização detalhada da viagem:
  - Lista ordenada dos pontos.
  - Mapa com marcadores dos locais e rota traçada.
- ▶️ Possibilidade de iniciar viagem e acompanhar o andamento.

### 🚛 Perfil Motorista

- 🔐 Login e logout.
- 🧭 Criação de viagens usando locais cadastrados.
- 📋 Listagem de suas próprias viagens.
- ▶️ Início da viagem.
- ✅ Marcação de “chegada” em cada ponto da rota.
- 🗺️ Visualização da rota no mapa e do progresso da viagem.

---

## 🧱 3. Arquitetura e tecnologias

### 🏗️ Arquitetura

- 🖥️ **Backend**: API REST com Spring Boot, camada de serviços e repositórios JPA.
- 🌐 **Frontend**: Next.js e React (utilizando TypeScript).
- 🗄️ **Banco de dados**: MySQL local.
- 🗺️ **Mapas**: Google Maps JavaScript API + Places API.

### 📦 Versões usadas no desenvolvimento

| Componente           | Versão aproximada              |
|----------------------|--------------------------------|
| ☕ Java              | 17                             |
| 🌱 Spring Boot       | 3.5.x                          |
| 🗄️ MySQL             | 8.x                            |
| 🟩 Node.js           | 22.16.0                        |
| 📦 npm               | 10.9.2                         |
| ⚛️ Next.js           | 16.0.3                         |
| ⚛️ React             | 19.2.0                         |

---

## 📁 4. Estrutura de pastas (raiz do repositório)

gestaoViagens/
├─ gestaoViagens-backend/
│  ├─ src/main/java/com/gestaoViagens/...
│  ├─ src/main/resources/application.properties
│  └─ pom.xml
└─ gestaoViagens-frontend/
   └─ gestao/
      ├─ src/
      │  ├─ pages/
      │  │  ├─ login/
      │  │  ├─ admin/
      │  │  └─ motorista/
      │  ├─ components/
      │  ├─ contexts/
      │  ├─ hooks/
      │  └─ services/
      ├─ public/
      ├─ package.json
      └─ .env.local (criado pelo usuário)
🧩 5. Pré-requisitos
☕ Java 17 instalado e configurado (JAVA_HOME).

📦 Maven 3.9+.

🗄️ MySQL 8.x rodando localmente.

🟩 Node.js 22.16.0 e npm 10.9.2 (ou compatíveis).

🌐 Conta Google para criar projeto na Google Cloud Platform.

🔙 6. Backend – configuração e execução
🗄️ 6.1. Banco de dados
Crie o banco de dados local:

CREATE DATABASE gestaoViagens
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
Crie um usuário ou use o root (apenas ambiente local):

CREATE USER 'gestao'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON gestaoViagens.* TO 'gestao'@'localhost';
FLUSH PRIVILEGES;

⚙️ 6.2. application.properties
Em gestaoViagens-backend/src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/gestaoViagens?useSSL=false&serverTimezone=America/Sao_Paulo
spring.datasource.username=gestao
spring.datasource.password=senha_segura
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

A aplicação está configurada para criar/atualizar as tabelas automaticamente via JPA (ddl-auto=update).

▶️ 6.3. Executando o backend
Na pasta gestaoViagens-backend:

mvn spring-boot:run

ou rodar a classe GestaoViagensApplication pela IDE

A API ficará disponível em:
http://localhost:8080

Usuário padrão (exemplo, ambiente local):

👨‍💼 Admin: admin@tripflow.com / admin123

🚛 Motorista: motorista@tripflow.com / motorista123

🌐 7. Frontend – configuração e execução
Na pasta gestaoViagens-frontend:

📦 7.1. Instalar dependências

npm install

🔐 7.2. Variáveis de ambiente (.env.local)
Crie o arquivo .env.local em gestaoViagens-frontend:

touch .env.local

Conteúdo sugerido:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=SEU_TOKEN_DO_GOOGLE_AQUI

NEXT_PUBLIC_API_BASE_URL é usado pelos serviços do frontend para chamar a API do backend.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY será usado nos componentes de mapa/autocomplete.

▶️ 7.3. Executando o frontend
Ainda em gestaoViagens-frontend:

npm run dev

Aplicação disponível em:
http://localhost:3000

Rotas principais:

🔐 /login – tela de autenticação.

🏠 /admin – dashboard inicial de administrador.

📍 /admin/locais – cadastro e listagem de locais.

🧭 /admin/viagens – listagem e criação de viagens (admin).

🚛 /motorista/viagens – listagem e acompanhamento de viagens do motorista.

🗺️ 8. Configurando a API Key do Google Maps
🧾 8.1. Criar projeto na Google Cloud
Acesse: https://console.cloud.google.com

No topo, clique em Selecionar projeto → Novo projeto.

Dê um nome (ex.: gestao-viagens) e crie o projeto.

✅ 8.2. Ativar as APIs necessárias
Com o projeto selecionado:

Acesse APIs e serviços → Biblioteca.

Busque e ative:

Maps JavaScript API

Places API

Confirme que ambas estão com status Ativada.

🔑 8.3. Criar a API Key
Vá em APIs e serviços → Credenciais.

Clique em + Criar credenciais → Chave de API.

Uma chave será gerada.

🛡️ 8.4. Restringir a Key (recomendado)
Ainda na tela da chave criada:

Clique sobre a chave para editar.

Em Restrições de aplicação, selecione Referenciadores HTTP (sites) e adicione:

http://localhost:3000/*

Em Restrições de API, selecione:

Maps JavaScript API

Places API

Salve.

🔗 8.5. Configurar no projeto
Copie a chave e coloque no .env.local:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
Reinicie o servidor do Next (npm run dev) para garantir que o valor foi carregado.

📝 9. Observações
🔒 Projeto focado em ambiente local e fins acadêmicos; ajustes de segurança, logs, monitoramento e deploy em produção devem ser feitos à parte.

💰 A cobrança da Google Cloud para uso de Maps/Places depende da sua conta e limites gratuitos; verifique sempre o painel de faturamento.
