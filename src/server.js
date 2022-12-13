import express from "express";
import joi from "joi";
import connection from "./database/database.js";
import dayjs from "dayjs";

const app = express();
app.use(express.json());

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    stockTotal: joi.number().required().min(1),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().required().greater(0)
});

const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().min(10).max(11).pattern(/^[0-9]+$/).required(),
    cpf: joi.string().length(11).pattern(/^[0-9]+$/).required(),
    birthday: joi.date().required()
});

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
})

app.post("/games", async(req,res) => {
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
            VALUES ($1,$2,$3,$4,$5)`,
            [name, image, stockTotal, categoryId, pricePerDay]
        );
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.get("/customers",async(req,res) => {
    const cpf = req.query.cpf;
    const stringcpf = `'${cpf}%'`;
    try{
        console.log(cpf)
        if(cpf){
            const customersCpf = await connection.query(`
            SELECT * FROM customers WHERE cpf ilike ${stringcpf}`);
            return res.send(customersCpf.rows);
        }
        const customers = await connection.query(`SELECT * FROM customers`);
        res.send(customers.rows);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.get("/customers/:id", async(req,res) => {
    const id = req.params.id;
    try{
        const customerId = await connection.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        if(customerId.rows.length === 0){
            return res.sendStatus(404);
        }
        res.send(customerId.rows);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 

});

app.put("/customers/:id", async(req,res) => {
    const id = req.params.id;
    const {name, phone, cpf, birthday} = req.body;
    const { error } = customerSchema.validate(req.body, { abortEarly: false });
    if(error){
        return res.sendStatus(400);
    }
    try{
        const hasCustomer = await connection.query(`SELECT * FROM customers WHERE cpf = $1`, [cpf]);
        console.log(hasCustomer.rows)
        if(hasCustomer.rows.length > 0){
            return res.sendStatus(409);
        }
        const customerId = await connection.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        if(customerId.rows.length === 0){
            return res.sendStatus(404);
        }
        await connection.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4
        WHERE id = $5`, [name, phone, cpf, birthday, id]);
        res.sendStatus(200);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/customers", async(req,res) => {
    const {name, phone, cpf, birthday} = req.body;
    const { error } = customerSchema.validate(req.body, { abortEarly: false });
    if(error){
        return res.sendStatus(400);
    }
    try{
        const hasCustomer = await connection.query(`SELECT * FROM customers WHERE cpf = $1`, [cpf]);
        if(hasCustomer.rows.length > 0){
            return res.sendStatus(409);
        }
        await connection.query(`INSERT INTO customers (name, phone, cpf, birthday) 
        VALUES ($1,$2,$3,$4)`, [name, phone, cpf, birthday]);
        res.sendStatus(201);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.get("/rentals", async(req,res) => {
    try{
        const rentals = await connection.query(`SELEC`)

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.post("/rentals", async(req,res) => {
    const {customerId, gameId, daysRented} = req.body;
    if(Number(daysRented) <=0){
        return res.sendStatus(400);
    }
    const rentDate = `${dayjs().year()}-${dayjs().month()+1}-${dayjs().date()}`
    const returnDate = null;
    const delayFee = null;

    try{
        const customerExists = await connection.query(`SELECT * FROM customers WHERE id=$1`,[customerId]);
        const priceGame = await connection.query(`SELECT "pricePerDay" FROM games WHERE id=$1`, [gameId]);

        if(customerExists.rows.length === 0 || priceGame.rows.length ===0){
            return res.sendStatus(400);
        }
        const originalPrice = daysRented * Number(priceGame.rows[0].pricePerDay)*100;

        await connection.query(`INSERT INTO rentals 
        ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
        VALUES ($1,$2,$3, $4, $5, $6, $7)`,
        [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]);
        res.sendStatus(201);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});

app.delete("/rentals/:id", async(req,res) => {
    const id = req.params.id;
    try{
        const rentExist =  await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if(rentExist.rows.length === 0){
            return res.sendStatus(404);
        }
        if(rentExist.rows[0].returnDate !== null){
            return res.send(400);
        }
        await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
        
        res.sendStatus(200);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/rentals/:id/return", async(req,res) => {
    const id =req.params.id;
    const returnDate = `${dayjs().year()}-${dayjs().month()+1}-${dayjs().date()}`
    let delayFee;
     
    try{
        const rental = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if(rental.rows.length === 0){
            return res.sendStatus(404);
        }
        if(rental.rows[0].returnDate !== null){
            return res.sendStatus(400);
        }
        const dateEnd= new Date(returnDate).getTime();
        const dateInit = new Date(rental.rows[0].rentDate).getTime();
        const timePast = Math.ceil((dateEnd + 3*3600*1000 - dateInit)/(1000*60*60*24));
        console.log(timePast, rental.rows[0].daysRented)

        if(rental.rows[0].daysRented - timePast >= 0){
            delayFee = 0
        }
        else{
            delayFee = timePast - rental.rows[0].daysRented ;
        }
        console.log(dateEnd,dateInit,timePast)
        await connection.query(`
            UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`, 
            [returnDate, delayFee, id]);
        res.sendStatus(200);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
});


app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });

