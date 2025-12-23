# recruitment-backend-track-typescript
An evaluation exercise for candidates willing to test their back-end capabilities. Typescript language track

## Project structure

```
src/
├── controllers/
├── generated/
├── middlewares/
├── routes/
├── services/
├── types/
└── utils/
```

## Environment variables

To be able to run the project you need to create a `.env` file in the root directory of the project. Below is a list of the environment variables that need to be set:

- `BACKEND_PORT`
- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_ROOT_PASSWORD`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `DATABASE_PORT`
- `JWT_SECRET`
- `JWT_DURATION`
- `NODE_ENV`
- `LOG_LEVEL`

## Authentication

The authentication is based on JWT.

## Data persistence

The data persistence layer is based on a containerized MySQL database using Prisma as the ORM of choice. The schema is defined in the `prisma/schema.prisma` file.

## Logging and monitoring

The logging and monitoring system is based on Pino. 

Other than errors, requests and responses are also logged with the following information:

- Request method
- Request path
- Request query
- Request ip

- Response status code
- Response duration

## Tests

Unit tests are realized using the node built in test package.

Integration tests are realized with supertest library.

You can run tests directly in the container with the following (avaiable only if NODE_ENV !== 'production'):

    docker-compose exec recruitment-backend node --import tsx --test src/**/*.test.ts

or with the already setted npm script:

    docker compose exec recruitment-backend npm run test

Note that to successfully run the integration tests you need to have the backend and the database containers running.

## How to run the project

### Docker compose

The project is shipped with a docker-compose file to ease the setup of the environment.

To run the project with docker compose you can run the following commands:

    docker compose up --build
    docker-compose exec recruitment-backend npx prisma migrate dev

The first command will build the backend image and start both the db and the backend containers.

The second command will run the database migrations. Note that it needs to be executed only the first time the project is run or whenever the database schema changes.

To stop the project you can run:

    docker compose down

If NODE_ENV env variable is setted to `production`, the project will transpile the TypeScript code when creating backend image and will instal only production dependencies.
Note that there still is a bind mount in the backend volumes that binds to the local code directory.

## OpenAPI & SwaggerUI

An openapi.json file is provided in the project root directory.

The swagger does not utilize it directly. Instead it uses options provided in the /utils/swagger.ts file and the comments in the routers to serve an interactive API documentation.

To generate the openapi.json file you can run the following command (defined in the package.json):

    npm run openapi
