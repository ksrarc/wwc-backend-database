import Repository from "../repositories/groups.repository.js";
import AppError from "../lib/application.error.js";
import { buildCreateSchema, buildDeleteByIdSchema } from './groups.schema.js';

const Service = (dbClient) => {

    const repository = Repository(dbClient);

    const createSchema = buildCreateSchema().external(async (value, helpers) => {
        try {
            console.info('external validation', value);
            const groupCount = await repository.countByName(value.name);
            if (groupCount > 0) {
                const error = helpers.error('_root');
                error.path = ['_root'];
                error.message = 'Ya existe un grupo con ese nombre';
                return error;
            }
            return value;
        } catch (e) {
            const error = helpers.error('_root');
            error.path = ['_root'];
            error.message = 'Intente mas tarde, algo fallo, no fue su culpa.';
            return error;
        }
    });

    const deleteByIdSchema = buildDeleteByIdSchema();

    const getAll = async () => {
        return await repository.getAll();
    }

    const getById = async (id) => {
        return await repository.getById(id);
    }

    const deleteById = async (id) => {
        const newId = await deleteByIdSchema.validateAsync(id);
        return await repository.deleteById(newId);
    }

    const create = async (group) => {
        const newGroup = await createSchema.validateAsync(group, {
            abortEarly: false
        });
        return await repository.create(newGroup);
    }

    const fullUpdateById = async(group) => {

        // validaciones de campos primero
        const name = validatedName(group.name);

        // validaciones con la base de datos
        const existingGroup = await repository.getById(group.id);
        if (!existingGroup) {
            throw AppError('El grupo a modificar no existe', 404);
        }   

        // validaciones con la base de datos
        const groupCount = await repository.countByNameNotId(name, group.id);
        if (groupCount > 0) {
            throw AppError('Ya existe otro grupo con ese nombre', 409);
        }
        
        return await repository.fullUpdateById({
            ...group,
            name
        });
    }

    const validatedName = (newName) => {
        // limpiar los datos
        const name = (newName || '').trim();
        // validar los campos individuales
        if (name.length === 0) {
            throw AppError('El nombre es requerido', 400);
        }
        if (name.length > 30) {
            throw AppError('El nombre debe ser menor de 30 caracteres', 400);
        }

        return name;
    }

    return {
        getAll,
        getById,
        deleteById,
        create,
        fullUpdateById,
    }
}

export default Service;