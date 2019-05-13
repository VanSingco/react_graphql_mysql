const User = {
    posts(parent, args,  {db}, info){
        console.log(parent)
        return db.posts.filter((post) => {
            return post.user === parent.id
        })
    }
}

export {User as default}