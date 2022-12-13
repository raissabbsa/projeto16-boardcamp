import express from "express";
import connection from "./database/database.js";
import dayjs from "dayjs";
import cors from "cors";
import gameRouter from "./routes/gameRoutes.js"
import categoriesRouter from "./routes/categoriesRoutes.js"
import customerRouter from "./routes/customersRoutes.js"
import rentalRouter from "./routes/rentalsRouters.js"

const app = express();
app.use(express.json());
app.use(cors());
app.use(gameRouter);
app.use(categoriesRouter);
app.use(customerRouter);
app.use(rentalRouter)

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });

