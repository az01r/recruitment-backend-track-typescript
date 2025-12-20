import express from "express";
import "dotenv/config";
import helmet from "helmet";
import corsManager from "./middlewares/cors-manager.js";
import notFoundRouter from "./middlewares/not-found-route.js";
import errorRouter from "./middlewares/error-route.js";
import userRouter from "./routers/user-router.js";
import taxProfileRouter from "./routers/tax-profile-router.js";
import { checkDbConnection } from "./utils/check-db-connection.js";

const app = express();

await checkDbConnection();

app.use(express.json());

app.use(helmet()); // Security headers

app.use(corsManager);

app.use("/user", userRouter);
app.use("/tax-profile", taxProfileRouter);
// app.use("/invoice", invoiceRouter);

app.use(notFoundRouter);

app.use(errorRouter);

app.listen(process.env.BACKEND_PORT || 3000, () => {
  console.log(`Server started on port ${process.env.BACKEND_PORT || 3000}`);
});
