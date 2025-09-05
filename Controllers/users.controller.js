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
            user.password = String(hashPassword);

        }
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60, // one hour
            sameSite: "strict",
        })
        console.log(res)
        const newUser = await userModel.create({ ...user, token });
        return res.status(201).json({ error: false, message: "successful", newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "internal server error" });
    }
};

const logout = async (req, res) => {
    try {
        const cookies = req.cookies
        if (cookies.token) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });
        } else {
            return res.status(200).json({ message: "you must (log in or register if you have not account) first" })
        }
        return res.status(200).json({ message: "loged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }


}


const authUser = async (req, res) => {
    const token = req.cookies.token; // or req.cookies["__session"]

    if (!token) {
        return res.status(401).json({ logIn: false, message: "no token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email })
        return res.status(200).json({
            logIn: true,
            user: user,
        });
    } catch (error) {
        return res.status(401).json({ logIn: false, message: "invalid or expired token" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(404).json({ message: 'email or password is not found' })
        }
        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: 'User is not exist, please sign up first' })
        }
        const isPasswordVaild = await bcrypt.compare(password, userExist.password);
        if (!isPasswordVaild) {
            return res.status(401).json({ message: "password is wrong" })
        }
        const token = jwt.sign({ id: userExist._id, email, password }, process.env.JWT_SECRET, { expiresIn: 1000 * 60 * 60 });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60,
            sameSite: "lax",
        })
        return res.status(200).json({ token })

    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
    }
}

export { getAllUsers, register, authUser, logout, login }