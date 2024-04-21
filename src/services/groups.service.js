import Repository from "../repositories/groups.repository.js";
const Service = (dbClient) => {

    const repository = Repository(dbClient);

    const getAll = async () => {
        return await repository.getAll();
    }

    return {
        getAll
    }
}

export default Service;