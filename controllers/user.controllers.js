import { User } from "../models/user.models.js";
import { Team } from "../models/team.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};


const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if(password.length() <8){
      return res.status(400).json({error: "Password must be atleast 8 characters"});
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Weak password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error in registration",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!password) return res.status(400).json({ error: "Password is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) return res.status(400).json({ error: "User not found!" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

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
const createTeam = async (req, res) => {
  try {
    if (req.user.team) {
      return res.status(400).json({ message: "You already belong to a team" });
    }

    const team = await Team.create({
      name: req.body.name,
      owner: req.user.id,
      members: [req.user.id]
    });

    await User.findByIdAndUpdate(req.user.id, { team: team._id });

    res.status(201).json({ message: "Team created", team });

  } catch (error) {
    res.status(500).json({ message: "Failed to create team" });
  }
};

const addUserToTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.user.team);

    if (!team || team.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only team owner can add users" });
    }

    const { userId } = req.body;

    if (team.members.includes(userId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    team.members.push(userId);
    await team.save();

    await User.findByIdAndUpdate(userId, { team: team._id });

    res.status(200).json({ message: "User added to team" });

  } catch (error) {
    res.status(500).json({ message: "Failed to add user to team" });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(400).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.team)
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({
      teamName: team.name,
      owner: team.owner,
      members: team.members
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};

export { registerUser, loginUser, getUser, createTeam, addUserToTeam, getTeamMembers }

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzg4NzQxZDI4NjU5MGIxYzk2NDk3MyIsImlhdCI6MTc2OTUwNjYyNSwiZXhwIjoxNzY5NTkzMDI1fQ.poZ8YwCPk0FhMiYuwGOw6PxsL5BQUZNx_9F-C8naOp0"    69788741d286590b1c964973

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzg4NzVlOGI3MTk5ZThmODE2NjU0NiIsImlhdCI6MTc2OTUwNjY1NCwiZXhwIjoxNzY5NTkzMDU0fQ.aWgcDHsTFE6dscF4GhYMdgdKev_-EDTKofDOlYtCz3U"    6978875e8b7199e8f8166546