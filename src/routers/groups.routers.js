import Router from "express-promise-router";

const GroupsRouter = () => {

    const router = Router();

    router.get('/', (req, res, next) => {res.end(); next()});

    return router;
};

export default GroupsRouter;