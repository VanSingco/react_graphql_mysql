import { queryData } from "./function";
import getUserId from '../utils/getUserId';

const Query = {
    async users(parent, args, {connection}, info){
        const users = await queryData(connection, 'SELECT * FROM users')

        return users;
    
    },

    async profile(parent, args, {connection, request}, info){
        const userId = getUserId(request);

        const users = await queryData(connection, `SELECT * FROM users WHERE username='${args.username}'`)
        if (!users[0]) {
            throw new Error("User not found")
        }

        return users[0];
    },

    async req_user(parent, args, {connection, request}, info){
        const userId = getUserId(request, false);

        if (userId === null) {
            return null
        }

        console.log('id', userId)
        const users = await queryData(connection, `SELECT * FROM users WHERE id=${userId}`)

        console.log(users)

        return users[0];
    },
}

export {Query as default}