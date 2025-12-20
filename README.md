# recruitment-backend-track-typescript
An evaluation exercise for candidates willing to test their back-end capabilities. Typescript language track

# The first time you run the project

    docker compose up -d recruitment-db
    npx prisma migrate dev
    docker compose up -d recruitment-backend

# Once you migrate the database, you can run the project with:

Development mode:

    docker compose up -d

Pre-production mode:

    docker compose -f docker-compose.preprod.yml up

