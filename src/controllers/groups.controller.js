import Service from "../services/groups.service.js";

const Controller = () => {

    const getAll = async (req, res) => {
        const service = Service(req.dbClient);

        const groups = await service.getAll();
        res.status(200).json(groups);
    }

    const getById = async (req, res) => {

        const service = Service(req.dbClient);
        const group = await service.getById(req.params.id);
        if (group) {
            res.status(200).json(group);
        } else {
            res.status(404).end();
        }
    }

    const deleteById = async (req, res) => {
        const service = Service(req.dbClient);
        const deleted = await service.deleteById(req.params.id);
        if (deleted) {
            res.status(200).end();
        } else {
            res.status(404).end();
        }
    }

    const create = async (req, res) => {
        const service = Service(req.dbClient);
        const group = req.body;
        const createdGroup = await service.create(group);
        res.status(201).json(createdGroup);
    }

    return {
        getAll,
        getById,
        deleteById,
        create
    }
}

export default Controller;