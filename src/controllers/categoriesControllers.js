import connection from "../database/database.js";

 export async function getCategories(req,res){
    try{
        const categories = await connection.query(`
        SELECT * FROM categories`);
        res.send(categories.rows);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

export async function postCategories(req,res){
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
}