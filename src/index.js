import { GraphQLServer, PubSub } from "graphql-yoga";
import {resolvers} from './resolver/index';
import express from 'express';
import db from './db';
import mysql from 'mysql';

const pubsub = new PubSub()


const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'authentication'
  });

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
    }
    console.log('Successfuly connected to database!')
});


const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request){
        return {
            connection,
            db,
            request,
            pubsub,
            url: request.request ? request.request.protocol + "://" + request.request.get("host") : ''
        }
    },
})

// for static files
server.express.use(express.static('public'))
server.express.use('/uploads',express.static('uploads'))

// server.express.get('*', (req, res) => {
//     return res.sendFile(path.resolve(__dirname, '../public', 'index.html'))
// })

const options = {
    port: process.env.PORT || 8000,
    endpoint: '/graphql',
    playground: '/playground',
}
server.start(options, ({ port }) => {
    console.log(`Server started, listening on port ${port} for incoming requests.`)
})