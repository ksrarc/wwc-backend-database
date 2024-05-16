import joi from 'joi';

const colors = [
    'white',
    'black',
    'red'
];

export const buildDeleteByIdSchema = () => joi.number().required();

export const buildCreateSchema = () => joi.object({
    name: joi.string().trim().required().max(30).messages({
        'string.empty': 'Nombre es requerido',
        'string.max': 'El nombre debe tener maximo 30 caracters',
    }),
    color: joi.string().trim()
        .valid(...colors)
        .optional()
        .default('white')
        .messages({
            'any.only': 'Color no permitido'
    }),
})