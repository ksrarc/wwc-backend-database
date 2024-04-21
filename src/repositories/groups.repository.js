const GET_ALL = `SELECT id, name, color FROM groups`;

const Repository = (dbClient) => {

    const getAll = async () => {
        const result = await dbClient.query(GET_ALL);
        return result.rows;
    };

    return {
        getAll,
    }
}

export default Repository;