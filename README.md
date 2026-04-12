# 🚦 Sistema de Escalas para Agentes de Trânsito

> Sistema web completo para gestão e geração de escalas de serviço de agentes de trânsito, com controle de determinações, tipos de serviço e permuta entre agentes.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Execução com Docker](#execução-com-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)

---

## Sobre o Projeto

O **Sistema de Escalas para Agentes de Trânsito** é uma aplicação fullstack desenvolvida para automatizar e gerenciar a elaboração de escalas de serviço de órgãos de trânsito. O sistema permite cadastrar servidores, definir tipos de serviço com cálculo automático de horas noturnas e adicionais, gerar escalas diárias, registrar determinações de área de atuação e realizar permutas entre agentes de forma organizada e auditável.

---

## Funcionalidades

- **Autenticação e Autorização** — Login com JWT, controle de acesso por perfil (Administrador / Usuário comum)
- **Gestão de Servidores** — Cadastro, edição e inativação lógica de agentes (sem exclusão física do banco)
- **Tipos de Serviço** — Cadastro de turnos com horário de início/fim, cálculo automático de horas totais, horas noturnas e adicional noturno
- **Escala Diária** — Geração de escalas vinculando servidor, data e tipo de serviço, com restrição de duplicidade por servidor/dia
- **Determinações** — Registro de área de atuação, setor e instruções por escala
- **Permuta de Escalas** — Troca de escalas entre dois servidores de forma atômica
- **Visualização Mensal** — Painel com visualização da escala em formato de calendário mensal
- **Exportação em PDF** — Geração de relatórios da escala em PDF diretamente no navegador
- **Painel de Usuários** — Gerenciamento de usuários do sistema (restrito ao Administrador)
- **Registro de Novos Usuários** — Cadastro de usuários com controle de acesso

---

## Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.5.9 | Framework principal |
| Spring Security | — | Autenticação e autorização |
| Spring Data JPA | — | Persistência de dados |
| Auth0 Java JWT | 4.4.0 | Geração e validação de tokens JWT |
| PostgreSQL | — | Banco de dados relacional |
| Lombok | — | Redução de boilerplate |
| Maven | — | Gerenciador de dependências |
| Docker | — | Containerização |

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Angular | 21 | Framework principal |
| TypeScript | ~5.9 | Linguagem principal |
| RxJS | ~7.8 | Programação reativa |
| jsPDF + AutoTable | 4.x / 5.x | Exportação de relatórios em PDF |
| SweetAlert2 | 11.x | Alertas e confirmações |
| SCSS | — | Estilização |

---

## Arquitetura

O projeto segue uma arquitetura cliente-servidor desacoplada:

```
sistema-escala-transito/
├── backend/
│   └── escala-api/          # API REST com Spring Boot
│       ├── controller/      # Endpoints REST
│       ├── service/         # Regras de negócio
│       ├── repository/      # Acesso ao banco (Spring Data JPA)
│       ├── model/           # Entidades JPA
│       ├── dto/             # Objetos de transferência de dados
│       ├── security/        # Filtros JWT e configurações de segurança
│       └── config/          # CORS, DataSeeder
└── frontend/
    └── src/app/
        ├── components/      # Telas da aplicação
        ├── services/        # Chamadas HTTP à API
        ├── models/          # Interfaces TypeScript
        ├── guards/          # Proteção de rotas (Auth e Admin)
        └── interceptors/    # Injeção automática do token JWT
```

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Java 21+](https://adoptium.net/)
- [Maven 3.9+](https://maven.apache.org/)
- [Node.js 20+](https://nodejs.org/) e npm 11+
- [Angular CLI 21+](https://angular.io/cli) — `npm install -g @angular/cli`
- [PostgreSQL 14+](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) _(opcional, para execução em container)_

---

## Instalação e Execução

### Backend

**1. Configure o banco de dados**

Crie um banco no PostgreSQL:
```sql
CREATE DATABASE escala_transito_db;
```

**2. Configure as variáveis de ambiente**

Defina as variáveis `DB_URL`, `DB_USER`, `DB_PASSWORD` e `JWT_SECRET` no seu sistema ou use os valores padrão do `application.properties` para desenvolvimento local.

**3. Execute a API**

```bash
cd backend/escala-api
./mvnw spring-boot:run
```

A API estará disponível em: `http://localhost:8081`

---

### Frontend

```bash
cd frontend
npm install
ng serve
```

O frontend estará disponível em: `http://localhost:4200`

---

### Execução com Docker

Para containerizar o backend, utilize o `Dockerfile` presente em `backend/escala-api/`:

```bash
cd backend/escala-api

# Build da imagem
docker build -t escala-api .

# Execução do container
docker run -p 8081:8081 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/escala_transito_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=sua_senha \
  -e JWT_SECRET=seu_segredo_jwt \
  escala-api
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão (dev) |
|---|---|---|
| `DB_URL` | URL de conexão com o PostgreSQL | `jdbc:postgresql://localhost:5432/escala_transito_db` |
| `DB_USER` | Usuário do banco de dados | `postgres` |
| `DB_PASSWORD` | Senha do banco de dados | — |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | — |

> ⚠️ **Atenção:** Nunca exponha as variáveis de ambiente com valores reais em repositórios públicos. Use arquivos `.env` ou cofres de segredos em produção.

---

## Endpoints da API

Todos os endpoints (exceto autenticação) requerem o header:
```
Authorization: Bearer <token_jwt>
```

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Realiza login e retorna o token JWT |
| `POST` | `/auth/register` | Cadastra novo usuário |

### Servidores
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/servidores` | Lista todos os servidores |
| `POST` | `/api/servidores` | Cadastra um novo servidor |
| `PUT` | `/api/servidores/{id}` | Atualiza dados de um servidor |
| `DELETE` | `/api/servidores/{id}` | Inativa logicamente um servidor |

### Escalas Diárias
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/escalas` | Lista todas as escalas |
| `POST` | `/api/escalas` | Cria uma nova escala |
| `DELETE` | `/api/escalas/{id}` | Remove uma escala |
| `POST` | `/api/escalas/permutar` | Realiza permuta entre duas escalas |

### Tipos de Serviço
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/tipos-servico` | Lista todos os tipos de serviço |
| `POST` | `/api/tipos-servico` | Cadastra um novo tipo de serviço |
| `PUT` | `/api/tipos-servico/{id}` | Atualiza um tipo de serviço |
| `DELETE` | `/api/tipos-servico/{id}` | Remove um tipo de serviço |

### Determinações
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/determinacoes` | Lista todas as determinações |
| `POST` | `/api/determinacoes` | Cria uma nova determinação |
| `DELETE` | `/api/determinacoes/{id}` | Remove uma determinação |

### Usuários
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/usuarios` | Lista usuários (Admin) |
| `DELETE` | `/api/usuarios/{id}` | Remove um usuário (Admin) |

---

## Estrutura do Projeto

```
backend/escala-api/src/main/java/com/transito/escala/
├── config/
│   ├── CorsConfig.java              # Configuração de CORS
│   └── DataSeeder.java              # Dados iniciais para desenvolvimento
├── controller/
│   ├── AuthenticationController.java
│   ├── DeterminacaoController.java
│   ├── EscalaDiariaController.java
│   ├── ServidorController.java
│   ├── TipoServicoController.java
│   └── UsuarioController.java
├── dto/
│   ├── AuthenticationDTO.java
│   ├── EscalaDiariaDTO.java
│   ├── LoginResponseDTO.java
│   ├── PermutaDTO.java
│   └── RegisterDTO.java
├── enums/
│   └── SituacaoServidor.java        # ATIVO | INATIVO
├── model/
│   ├── Determinacao.java
│   ├── EscalaDiaria.java
│   ├── Servidor.java
│   ├── TipoServico.java
│   └── Usuario.java
├── repository/
│   ├── DeterminacaoRepository.java
│   ├── EscalaDiariaRepository.java
│   ├── ServidorRepository.java
│   ├── TipoServicoRepository.java
│   └── UsuarioRepository.java
├── security/
│   ├── AutenticacaoService.java
│   ├── SecurityConfigurations.java
│   ├── SecurityFilter.java
│   └── TokenService.java
├── service/
│   ├── DeterminacaoService.java
│   ├── EscalaDiariaService.java
│   ├── ServidorService.java
│   └── TipoServicoService.java
└── EscalaApiApplication.java

frontend/src/app/
├── components/
│   ├── escala-mensal/               # Visualização calendário mensal
│   ├── header/                      # Cabeçalho da aplicação
│   ├── login/                       # Tela de login
│   ├── painel-determinacoes/        # Gestão de determinações
│   ├── painel-usuarios/             # Gestão de usuários (Admin)
│   ├── registro/                    # Cadastro de usuários
│   ├── servidores/                  # Gestão de servidores
│   └── tipos-servico/              # Gestão de tipos de serviço
├── guards/
│   ├── auth-guard.ts               # Protege rotas autenticadas
│   └── admin-guard.ts              # Protege rotas administrativas
├── interceptors/
│   └── auth.interceptor.ts         # Injeta token JWT nas requisições
├── models/
│   ├── determinacao.ts
│   ├── escala.model.ts
│   ├── servidor.model.ts
│   └── tipo-servico.model.ts
└── services/
    ├── auth.ts
    ├── determinacao.service.ts
    ├── escala.ts
    ├── servidor.service.ts
    ├── tipo-servico.ts
    └── usuario.ts
```

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Faça o push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## Autor

Desenvolvido por **Paulo Gomes Jr.**

---

_© 2026 — Sistema de Escalas para Agentes de Trânsito_
