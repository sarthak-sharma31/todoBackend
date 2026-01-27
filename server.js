import express from "express";
import 'dotenv/config';
import connectDB from "./db/db.js";
import authRoutes from "./routes/user.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

app.use(cors({
  origin: "*"
}));

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes);
app.use('/todo', todoRoutes);

app.get('/', (req, res)=>{
    res.send("Hello from server!!")
});


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})
