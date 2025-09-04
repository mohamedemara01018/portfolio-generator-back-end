import userModel from '../Models/users.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        return res.status(200).json({ error: false, message: 'successful', users })
    } catch (error) {
        return res.status(500).json({ error: true, message: 'internal server error' })
    }
}


const register = async (req, res) => {
    const user = req.body;
    console.log(user);

    try {
        const userExist = await userModel.findOne({ email: user.email });
        if (userExist) {
            return res.status(409).json({ error: false, message: "user exist" });
        }
        const token = await jwt.sign({ email: user.email, password: user.password }, process.env.JWT_SECRET, { expiresIn: '6h' });
        console.log(token);
        if (user && user.password) {
            const saltvalue = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(String(user.password), saltvalue);
            user.password = String(hashPassword)
        }
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 1000, // one hour
            sameSite: "strict",
        })
        console.log(res)
        const newUser = await userModel.create(user);
        return res.status(201).json({ error: false, message: "successful", newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "internal server error" });
    }
};

// const login = async (req, res) => {
//     const { email, password } = req.body
//     try {
//         if (!email || !password) {
//             return res.status(404).json({ message: 'email or password is not found' })
//         }

//     } catch (error) {
//         return res.status(500).json({ message: 'internal server error' })
//     }
// }

export { getAllUsers, register }