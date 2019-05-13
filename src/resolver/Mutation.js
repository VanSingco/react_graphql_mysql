import bcrypt from 'bcryptjs';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import hashPassword from '../utils/hashPassword';
import {waterfall} from 'async';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import moment from 'moment';
import * as shortid from 'shortid';
import _  from 'lodash';
import { createWriteStream, readFileSync } from 'fs'
import Hogan from 'hogan.js';
import mkdirp from 'mkdirp';
import { queryData, insertData, updateData } from "./function";

const uploadDir = './uploads'

const template = readFileSync('./view/reset.hjs', 'utf-8')
const compiledTemplate = Hogan.compile(template)

const storeUpload = async ({ stream, filename }) => {
  const id = shortid.generate()
  const path = `${uploadDir}/${id}-${filename}`

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject),
  )
}



const processUpload = async upload => {
  const { stream, filename, mimetype, encoding } = await upload
  const { id, path } = await storeUpload({ stream, filename })
  return {id, path }
}

const Mutation = {
    async loginUser(parent, args, {connection}, info){
        const users = await queryData(connection, `SELECT * FROM users WHERE email='${args.data.email}'`)

        if (!users[0]) {
            throw new Error('User not found!')
        }

        const isMatch = await bcrypt.compare(args.data.password, users[0].password)
        
        if(!isMatch){
            throw new Error('Password not match')
        }

        return {
            user: users[0],
            token: generateToken(users[0].id)
        }
    },
    logout(parent, args, {connection, request}, info){
        // return prisma.mutation.updateUser({
        //     where: {id: args.id},
        //     data: {
        //         isActive: false
        //     }
        // }, info)
    },
    async createUser(parent, args, {connection}, info){

        const emailExist = await queryData(connection, `SELECT * FROM users WHERE email='${args.data.email}'`)
        const usernameExist = await queryData(connection, `SELECT * FROM users WHERE username='${args.data.username}'`)

        if (emailExist.length !== 0) {
            throw new Error(`Email ${args.data.email} is already taken`)
        }

        if (usernameExist.length !== 0){
            throw new Error(`Username ${args.data.username} is already taken`)
        }

       
        const password = await hashPassword(args.data.password);
        const data = {...args.data, password}
        console.log(data)
        const newUser = await insertData(connection, 'INSERT INTO users SET ?', data, 'users')
    
        return {
            user: newUser[0],
            token: generateToken(newUser[0].id)
        }

    },
    async changePassword(parent, {oldPassword, newPassword}, {connection, request}, info) {
        const userId = getUserId(request)
        const users = await queryData(connection, `SELECT * FROM users WHERE id=${userId}`);
        const user =  users[0]

        if (users.length === 0) {
            throw new Error('User not found')
        }
        const password = await hashPassword(newPassword);
        if (bcrypt.compareSync(oldPassword, user.password)) {
            const users = await updateData(connection, `UPDATE users SET password='${password}' WHERE id=${userId}`, userId, 'users')
            return users[0]
        }else {
            throw new Error('Old password is not match with your currently using password')
        }

    },
    async sendPasswordReset(parent, {email}, {connection}, info){
        const users = await queryData(connection, `SELECT * FROM users WHERE email='${email}'`)
        const user =  users[0]

        if (users.length === 0) {
            throw new Error(`${email} not found please try again`)
        }

        waterfall([
            (callback) => {
                crypto.randomBytes(20, (err, buff) => {
                    const token = buff.toString('hex');
                    callback(err, token)
                })
            },
            (token, callback) => {

                const current_time = Date.now() + 60*60*1000;
                const tokenExpired = moment(current_time).format("YYYY-MM-DD HH:mm:ss");
         
                updateData(connection, `UPDATE users SET passwordResetToken='${token}', passwordResetExpires='${tokenExpired}' WHERE id=${user.id}`, user.id, 'users')

                callback(null, token, user)
                console.log(user)
            }, 
            (token, user, callback) => {
                let smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'vansingco@gmail.com',
                        pass: '09103607533'
                    }
                });

                let mailOption = {
                    to: email,
                    from: `Authentication <dontreply@example.com>`,
                    subject: 'Authentication Password reset token',
                    html: compiledTemplate.render({link: `http://localhost:3000/reset/${token}`})
                }
                smtpTransport.sendMail(mailOption, (err, info) => {
                    callback(err, user)
                })
            } 
        ],(err) => {
            if (err) {
                console.log(err)
            }
            return user
        })
    },
    async passwordReset(parent, {token, password}, {connection}, info) {
        const current_time = Date.now();
        const tokenExpired = moment(current_time).format("YYYY-MM-DD HH:mm:ss");
        console.log(tokenExpired)
        const users = await queryData(connection, `SELECT * FROM users WHERE passwordResetToken='${token}' AND passwordResetExpires > NOW()`)
        const user = users[0]

        if (users.length === 0) {
            throw new Error("The token has been expired please try again")
        }

        const passwordHash = await hashPassword(password);

        const updateUser = await updateData(connection, `UPDATE users SET password='${passwordHash}', passwordResetToken=${null}, passwordResetExpires=${null} WHERE id=${user.id}`, user.id, 'users')
        console.log('update', updateUser)
        return updateUser[0];

    },
}

export {Mutation as default}