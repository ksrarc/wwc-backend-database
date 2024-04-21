import Repository from "../repositories/groups.repository.js";
import AppError from "../lib/application.error.js";

const Service = (dbClient) => {

    const repository = Repository(dbClient);

    const getAll = async () => {
        return await repository.getAll();
    }

    const getById = async (id) => {
        return await repository.getById(id);
    }

    const deleteById = async (id) => {
        return await repository.deleteById(id);
    }

    const create = async (group) => {
        
        // limpiar los datos
        const name = (group.name || '').trim();
        // validar los campos individuales
        if (name.length === 0) {
            throw AppError('El nombre es requerido', 400);
        }
        if (name.length > 30) {
            throw AppError('El nombre debe ser menor de 30 caracteres', 400);
        }

        const groupCount = await repository.countByName(name);
        if (groupCount > 0) {
            throw AppError('Ya existe un grupo con ese nombre', 409);
        }


        return await repository.create(group);
    }

    return {
        getAll,
        getById,
        deleteById,
        create
    }
}

export default Service;