import jwt from 'jsonwebtoken';

const generateToken = (userId) => {

    return jwt.sign({ userId }, 'singco#143',  { expiresIn: '7 days' })
    
}

export {generateToken as default}