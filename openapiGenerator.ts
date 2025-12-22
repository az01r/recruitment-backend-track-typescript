import fs from "fs";
import swaggerDocument from "./src/utils/swagger.js";

fs.writeFileSync("./openapi.json", JSON.stringify(swaggerDocument, null, 2));

console.log("openapi.json generated successfully");