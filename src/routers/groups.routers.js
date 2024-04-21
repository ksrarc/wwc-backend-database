import Router from "express-promise-router";
import Controller from "../controllers/groups.controller.js";
import continuator from "../lib/continue.decorator.js";

const GroupsRouter = () => {

    const router = Router();
    const controller = Controller();

    router.get('/', continuator(controller.getAll));
    router.get('/:id', continuator(controller.getById));
    router.delete('/:id', continuator(controller.deleteById));
    router.post('/', continuator(controller.create));

    return router;
};

export default GroupsRouter;