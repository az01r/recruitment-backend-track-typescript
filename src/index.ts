import express from "express";
import "dotenv/config";

const app = express();

app.get("/", (_req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.BACKEND_PORT || 3000, () => {
    console.log(`Server started on port ${process.env.BACKEND_PORT || 3000}`);
});
