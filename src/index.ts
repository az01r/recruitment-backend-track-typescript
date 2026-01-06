import express from "express";
import "dotenv/config";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import corsManager from "./middlewares/cors-manager.js";
import notFoundRouter from "./middlewares/not-found-route.js";
import errorRouter from "./middlewares/error-route.js";
import userRouter from "./routers/user-router.js";
import taxProfileRouter from "./routers/tax-profile-router.js";
import invoiceRouter from "./routers/invoice-router.js";
import swaggerDocument from "./utils/swagger.js";
import logger from "./utils/logger.js";
import requestLogger from "./middlewares/request-logger.js";

const app = express();

app.use(express.json());

app.use(helmet()); // Security headers

app.use(corsManager);

app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/user", userRouter);
app.use("/tax-profile", taxProfileRouter);
app.use("/invoice", invoiceRouter);

app.use(notFoundRouter);

app.use(errorRouter);

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(process.env.BACKEND_PORT || 3000, () => {
    logger.info(`Server started on port ${process.env.BACKEND_PORT || 3000}`);
    logger.info(`Swagger docs available at http://localhost:${process.env.BACKEND_PORT || 3000}/api-docs`);
  });
}

export default app;