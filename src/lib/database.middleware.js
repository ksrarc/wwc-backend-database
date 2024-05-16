// require router del paquete express-promise-router
import pg from 'pg'
const { Pool } = pg;
const pool = new Pool({
    // same as
    // user: process.env.PGUSER,
    // host: process.env.PGHOST,
    // database: process.env.PGDATABASE,
    // password: process.env.PGPASSWORD,
    // port: process.env.PGPORT,
})

const requireTransactionMap = {
    POST: true,
    PUT: true,
    DELETE: true,
}

const connectDatabase = async (req,res,next) => {
    // resolve db client
    let dbClient = null;
    try {
        dbClient = await pool.connect();
        req.dbClient = dbClient;
        req.doTransaction = requireTransactionMap[req.method] === true; 
        if (req.doTransaction) {
            await req.dbClient.query('BEGIN');
        }
        console.info('database connected');
        next();
    } catch (err) {
        res.status(503).end();
        next(err);
    }
}

const commitDatabase = async (req,_res,next) => {
    if (req.doTransaction) {
        await req.dbClient.query('COMMIT');
    }
    req.dbClient.release();
    req.dbClient = undefined;
    req.doTransaction = undefined;
    console.info('database disconnected');
    next();
}

const rollbackDatabase = async (err, req, res, next) => {
    try {
        if (req.doTransaction && req.dbClient){
            console.info('rollback transaction!');
            await req.dbClient.query('ROLLBACK');
        }
    } finally {
        req.dbClient.release();
        req.dbClient = undefined;
        req.doTransaction = undefined;
    }
    
    console.info('--- ERROR ---');
    console.error(err);
    let errorCode = 500;
    if (err.isApplicationError === true) {
        errorCode = err.errorCode;
    }
    if (err.isJoi) {
        // process errors
        const errorMap = {};
        err.details.forEach( validationError => {
            errorMap[validationError.path.join('')] = validationError.message;   
        });
        console.info('detalles', errorMap);   
        res.status(400).json({error: errorMap});
    } else {
        res.status(errorCode).json({
            error: err.message || "Cant process your request",
        });
    }
    next(err);
}

export {
    connectDatabase,
    commitDatabase,
    rollbackDatabase
};