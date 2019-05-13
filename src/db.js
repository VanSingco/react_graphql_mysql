const users = [
    {id: '1', fullname: 'van zachary', username: 'vansingco', email: 'vansingco@gmail.com', age: 20},
    {id: '2', fullname: 'sheena', username: 'sheena', email: 'sheena@gmail.com', age: 23},
    {id: '3', fullname: 'roan', username: 'roan', email: 'roan@gmail.com', age: 25}
];

const posts = [
    {id: '1', title: 'web design', content: 'asdadad', user: '1'},
    {id: '2', title: 'web development', content: 'asdadad', user: '1'},
    {id: '3', title: 'javascript', content: 'asdadad', user: '2'}
];

const db = {
    users,
    posts
}

export {db as default}