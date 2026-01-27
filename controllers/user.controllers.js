import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!password) return res.status(400).json({ error: "Password is required" });
        if (!(name || email)) return res.status(400).json({ error: "All feilds are required" });

        const existingEmail = await User.findOne({ email: email.toLowerCase() });

        if (existingEmail) { return res.status(400).json({ error: `User with this email already exists` }); }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24hr' });

        return res.status(200).json({ message: `User created successfully: name:${name}, email = ${email}`, token });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error in registeration', error });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!password) return res.status(400).json({ error: "Password is required" });
        if (!email) return res.status(400).json({ error: "Email is required" });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (!existingUser) return res.status(400).json({ error: "User not found!" });

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '24hr' });

        return res.status(200).json({ message: "Login Success!", token, user: { id: existingUser._id, name: existingUser.name, email: existingUser.email } });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal Server Error', error });
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const now = new Date();

        const day = now.toLocaleDateString("en-US", { weekday: "long" });
        const date = now.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return res.status(200).json({ message: "User Fetched Successfully", user, day, date });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal Server Error', error });
    }
}

export { registerUser, loginUser, getUser }