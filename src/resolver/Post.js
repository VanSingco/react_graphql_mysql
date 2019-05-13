const Post = {
    user(parent, args, {db}, info){
        return db.users.find((user) => {
            return user.id === parent.user
        })
    }
}

export {Post as default}