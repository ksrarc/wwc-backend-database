import "dotenv/config";
import express from 'express';
import cors from 'cors';
import mainRouter from './routers/async.router.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(mainRouter());

app.listen(port, () => {
    console.info(`listening on port: ${port}`);
});