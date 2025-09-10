import userModel from '../Models/users.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { transporter } from '../index.js';
import { mailOptionsHandle } from '../constant.js';

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
    try {
        const userExist = await userModel.findOne({ email: user.email });

        // لو المستخدم موجود ومفعل بالفعل
        if (userExist && userExist.isVerified) {
            return res.status(409).json({ error: true, message: "user already exists" });
        }

        // hash password
        if (user && user.password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(String(user.password), salt);
            user.password = hashPassword;
        }

        // generate token + code
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "6h" });
        const randomCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
        const expires = Date.now() + 1000 * 60 * 5; // 5 minutes

        // send email
        const mailOption = mailOptionsHandle(user.email, randomCode, user.firstName);
        await transporter.sendMail(mailOption);

        const newUserOptions = {
            ...user,
            token,
            image: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
            isVerified: false,
            verificationCode: randomCode,
            codeExpiresAt: expires,
        };

        let newUser;

        if (userExist) {
            // المستخدم موجود بس لسه مش مفعل → نحدث بياناته
            newUser = await userModel.findOneAndUpdate(
                { email: user.email },
                newUserOptions,
                { new: true }
            );
        } else {
            // مستخدم جديد
            newUser = await userModel.create(newUserOptions);
        }

        return res.status(201).json({ error: false, message: "successful, verification code sent", newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "internal server error" });
    }
};

const verify = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await userModel.findOne({ email });
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'user is not found, please register' })
        }
        if (user.verificationCode != code) {
            console.log(user.verificationCode, '   ', code)
            return res.status(400).json({ message: 'invaild code' })
        }
        if (user.codeExpiresAt < Date.now()) {
            return res.status(400).json({ message: 'code is expired, please click resend to send another code' })
        }
        res.cookie('token', user.token, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60, // one hour
            sameSite: "strict",
        })
        await userModel.findOneAndUpdate(
            { email: email },
            {
                isVerified: true,
                verificationCode: null,
                codeExpiresAt: null,
            },
            { new: true }
        );
        // user.isVerified = true;
        // user.verificationCode = null;
        // user.codeExpiresAt = null;
        return res.status(201).json({ message: 'email verifed successfully' })
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
    }

}


const reSendCode = async (req, res) => {
    const { email } = req.body
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'user is not found' })
        }
        const randomCode = Math.floor(100000 + (Math.random() * 900000));
        const expires = Date.now() + 1000 * 60 * 5;
        console.log(randomCode)
        const newUserOptions = {
            verificationCode: randomCode,
            codeExpiresAt: expires
        }
        const mailOption = mailOptionsHandle(email, randomCode, user.firstName);
        await transporter.sendMail(mailOption);

        const updateUser = await userModel.findOneAndUpdate(
            { email: user.email },
            newUserOptions,
            { new: true }
        );
        return res.status(201).json({ message: 'successful, verification code is resent', updateUser })
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
    }
}

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

export { getAllUsers, register, authUser, logout, login, verify, reSendCode }