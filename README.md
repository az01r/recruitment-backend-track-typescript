# recruitment-backend-track-typescript
An evaluation exercise for candidates willing to test their back-end capabilities. Typescript language track

# To run the project with docker-compose:

Development mode:

    docker compose up -d --build

"Production" mode:

    docker compose -f docker-compose.prod.yml up --build

Note that you can change the port exposed by the container by setting the environment variable BACKEND_PORT in a .env file in the root directory of the project.
