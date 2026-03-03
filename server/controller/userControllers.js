import { sequelize } from "../config/db.js"
import UserModel from "../models/userModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from "dotenv"
config()

const secret = process.env.JWT_SECRET
export async function getAllUsers(req, res) {
    try{
        const allUser = await UserModel.findAll({})
        return res.status(200).json({allUser})
    }
    catch(err){
        console.log(`Internal server error ${err}`)
    }
}

export async function signupController(req, res) {
    try{
        const { email, name, password } = req.body;
        if(!email || !name || !password){
            return res.status(400).json({error : 'Email, Name, Password are required'})
        }   

        const checkEmailquery = 'select id from users where email = $1'
        const existinguser = await sequelize.query(checkEmailquery, {
            bind :[ email],
            type : sequelize.QueryTypes.SELECT
        })

        if(existinguser.length> 0){

            return res.status(400).json({error : `email already registered`})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt);
        const role = req.body.role || 'user'
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPass, 
            role
        });
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email, 
                role : newUser.role
            }
        });

    }
    catch(err){
        console.error(err)
        return res.status(500).json({error : `Internal server error ${err}`})
    }
}


export async function loginController(req, res) {
    try{
        const {email, password} = req.body
        
        if(!email || !password) {
            return res.status(400).json({error : `Email password are required`})
        }

        const existingUser = await UserModel.findOne({where : {email}})
        if(!existingUser){
            return res.status(401).json({error : `Invalid email or password`})
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(!isMatch){
            return res.status(401).json({error : `Invalid credentials`})
        }
        const token = jwt.sign(
            { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role }, 
            secret,
            {expiresIn : `7d`}
        )
        res.cookie('token', token,{
            httpOnly : true,
            secure  : false,
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: "Login successful!",
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    }
    catch(err){
        return res.status(500).json({error : `Internal server error ${err}`})
    }    
}






export const getMe = (req, res) => {
    try {
        // req.user is set by isAuth middleware
        res.json(req.user);
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
