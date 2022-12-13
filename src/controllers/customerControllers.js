import connection from "../database/database.js";
import { customerSchema } from "../models/models.js";

export async function getCustomers(req,res){
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
}

export async function getCustomersById(req,res){
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

}

export async function putCustomersById(req,res){
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
}

export async function postCustomers(req,res){
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
}