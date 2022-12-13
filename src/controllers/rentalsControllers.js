import connection from "../database/database.js";

export async function getRentals(req,res){
    const customerId = req.query.customerId;
    const gameId = req.query.gameId;
    let newList = [];
    let list = [];
    try{
        const rentals = await connection.query(`SELECT * FROM rentals`);
        for(let i=0; i<rentals.rows.length;i++){
            const infoCustomer = await connection.query(`
            SELECT * FROM customers WHERE id = $1`,
            [rentals.rows[i].customerId]);
            const infoGame = await connection.query(`
            SELECT * FROM games WHERE id = $1`,
            [rentals.rows[i].gameId]);
            const category = await connection.query(`
            SELECT * FROM categories WHERE id = $1`,
            [infoGame.rows[0].categoryId]);

            list.push({
                ...rentals.rows[i],
                customer: {
                    id: infoCustomer.rows[0].id,
                    name: infoCustomer.rows[0].name
                },
                game: {
                    id: infoGame.rows[0].id,
                    name: infoGame.rows[0].name,
                    categoryId: infoGame.rows[0].categoryId,
                    categoryName: category.rows[0].name
                }
            });
        }
        if(gameId){
            for(let i=0; i< list.length;i++){
                if(list[i].gameId == gameId){
                    newList.push(list[i])
                }
            }
            return res.send(newList)
        }
        if(customerId){
            for(let i=0; i< list.length;i++){
                if(list[i].customerId == customerId){
                    newList.push(list[i])
                }
            }
            return res.send(newList)
        }
        res.send(list);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
}

export async function postRentals(req,res){
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

        const gameIdQuant = await connection.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId]);
        const gameStock = await connection.query(`SELECT "stockTotal" FROM games WHERE id = $1`, [gameId]);
        if(gameStock.rows[0].stockTotal<gameIdQuant.rows.length){
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
}

export async function deleteRentals(req,res){
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
}

export async function postReturnRentals(req,res){
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
}