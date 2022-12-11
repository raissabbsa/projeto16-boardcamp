import express from "express";
import joi from "joi";
import connection from "./database/database.js";

const app = express();
app.use(express.json());

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    stockTotal: joi.number().required().min(1),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().required().min(1)
})

app.get("/categories", async(req,res) => {
    try{
        const categories = await connection.query(`
        SELECT * FROM categories`);
        res.send(categories.rows);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/categories', async(req,res) => {
    const {name} = req.body;
    if(name.length === 0){
        return res.sendStatus(400);
    }
    try{
        const nameExists = await connection.query(`
        SELECT * FROM categories WHERE name = $1`,
        [name]);
        if(nameExists.rows.length>0){
            return res.sendStatus(409);
        }
        await connection.query(
            "INSERT INTO categories (name) VALUES ($1)",
            [name]
        );
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }  
});

app.get("/games", async(req,res) => {
    try{
        const games = await connection.query(`
        SELECT * FROM games`);
        res.send(games.rows);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.post("/games", async(req,res) => {
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    const { error } = gameSchema.validate(req.body, { abortEarly: false })

    const hasCategoryId = await connection.query(`SELECT * FROM categories WHERE id = $1`,
    [categoryId]);

    if(hasCategoryId.rows.length === 0 || error){
        return res.sendStatus(400);
    }
    const hasName = await connection.query(`SELECT * FROM games WHERE name = $1`,
    [name])
    if(hasName.rows.length>0){
        return res.sendStatus(409);
    }
    try{
        await connection.query(
            `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
            VALUES ($1,$2,$3,$4,$5)`,
            [name, image, stockTotal, categoryId, pricePerDay]
        );
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });

