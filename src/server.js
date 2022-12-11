import express from "express";

import connection from "./database/database.js";

const app = express();
app.use(express.json());

app.get('categories', async(req,res) => {

    try{
        const categories = await connection.query(`
        SELECT * FROM categories`);
        res.send(categories);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });