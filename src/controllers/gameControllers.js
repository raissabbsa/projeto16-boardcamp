import { gameSchema } from "../models/models.js";
import connection from "../database/database.js";

export  async function getGames(req,res){
    const name = req.query.name;
    try{
        const stringName = `'${name}%'`;
        if(name){
            const filterGames = await connection.query(`
            SELECT * FROM games WHERE name ilike ${stringName}`);
            return res.send(filterGames.rows);
        }
        const games = await connection.query(`
        SELECT * FROM games`);
        res.send(games.rows);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}
export async function postGames(req,res){
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    const { error } = gameSchema.validate(req.body, { abortEarly: false });

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
            VALUES ($1, $2, $3, $4, $5)`,
            [name, image, stockTotal, categoryId, pricePerDay]
        );
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
}