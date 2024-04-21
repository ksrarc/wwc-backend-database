const GET_ALL = `SELECT id, name, color FROM groups`;
const GET_BY_ID = `${GET_ALL} WHERE id = $1`;
const DELETE_BY_ID = `DELETE FROM groups WHERE id = $1`;

const Repository = (dbClient) => {

    const getAll = async () => {
        const result = await dbClient.query(GET_ALL);
        return result.rows;
    };

    const getById = async (id) => {
        const result = await dbClient.query(GET_BY_ID,[id]);
        return result.rows[0];
    };

    const deleteById = async (id) => {
        const result = await dbClient.query(DELETE_BY_ID,[id]);
        return result.rowCount > 0;
    }

    return {
        getAll,
        getById,
        deleteById
    }
}

export default Repository;