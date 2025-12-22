import swaggerJsdoc from 'swagger-jsdoc';
import "dotenv/config";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recruitment Backend API',
      version: '1.0.0',
      description: 'API documentation for the Recruitment Backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routers/*.ts'],
};

const swaggerDocument = swaggerJsdoc(options);

export default swaggerDocument;
