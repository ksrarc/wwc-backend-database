import "dotenv/config";
import express from 'express';
import cors from 'cors';
import mainRouter from './routers/async.router.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(mainRouter());

/// ejemplo middleware

// const router = express.Router();
// app.use('/test', router);

// router.use((req, res, next) => {
//     console.info('middleware 2');
//     next();
// });
// router.use((req, res, next) => {
//     console.info('middleware 1');
//     throw 'error';
//     next();
// });
// router.use((req, res, next) => {
//     console.info('middleware 3');
//     res.end();
//     next();
// });

app.listen(port, () => {
    console.info(`listening on port: ${port}`);
});