export const queryData = (connection, query) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error){
                reject(error);
            }else {
                resolve(results);
            }
        })
    })
    
}

export const insertData = (connection, query, args, table) => {
    return new Promise((resolve, reject) => {
        connection.query(query, args, (error, results) => {
            if (error){
                reject(error);
            }else {
                console.log(results.insertId)
                const query = `SELECT * FROM ${table} WHERE id=${results.insertId}`;
                connection.query(query, (err, res) => {
                    if (err) {
                        reject(error)
                    } else {
                        resolve(res);
                    }
                })
            }
        })
    })
    
}

export const updateData = (connection, query, id, table) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error){
                reject(error);
            }else {
                const q = `SELECT * FROM ${table} WHERE id=${id}`;
                connection.query(q, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res);
                    }
                })
            }
        })
    })
    
}

