import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas ক্লাউড কানেকশন
const mongoURI = "mongodb+srv://rupanjanmukherjee686_db_user:RhtdmQDuxfObt9M9@cluster0.5upqtsy.mongodb.net/dhara_portal?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Atlas Connected Successfully!"))
  .catch((err) => console.log("Database connection error: ", err));

// ইউজারের জন্য স্কিমা ও মডেল তৈরি
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// সরকারি অফিসারদের জন্য স্কিমা ও মডেল তৈরি
const officerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    officialId: { type: String, required: true, unique: true },
    role: { type: String, required: true }, // যেমন: district, field, state, central
    password: { type: String, required: true }
});
const Officer = mongoose.model('Officer', officerSchema);

// ১. সাইন-আপ (Signup) API রাউট (ইউজারদের জন্য)
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email!" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        
        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ২. সাইন-ইন বা লগইন (Signin) API রাউট (ইউজারদের জন্য)
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "You are not authorized!" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid Password!" });
        }
        
        res.json({ success: true, message: "Login Successful", name: user.name });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ৩. অফিসার রেজিস্টার করার API (ডাটাবেজে অফিসার সেভ করার জন্য)
app.post('/api/officer/signup', async (req, res) => {
    try {
        const { name, officialId, role, password } = req.body;
        
        const existingOfficer = await Officer.findOne({ officialId });
        if (existingOfficer) {
            return res.status(400).json({ success: false, message: "Officer already exists with this ID!" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newOfficer = new Officer({ name, officialId, role, password: hashedPassword });
        
        await newOfficer.save();
        res.status(201).json({ success: true, message: "Officer registered successfully in database!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ৪. অফিসার সাইন-ইন API (রোল যাচাই সহ)
app.post('/api/officer/signin', async (req, res) => {
    try {
        const { officialId, password, role } = req.body;
        
        const officer = await Officer.findOne({ officialId });
        if (!officer) {
            return res.status(401).json({ success: false, message: "Invalid Government ID!" });
        }
        
        // রোল ম্যাচ করছে কিনা চেক করা
        if (role && officer.role !== role) {
            return res.status(401).json({ success: false, message: `You are not authorized for the ${role} portal!` });
        }

        let isPasswordValid = false;
        if (officer.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, officer.password);
        } else {
            isPasswordValid = (password === officer.password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid Password!" });
        }
        
        res.json({ success: true, message: "Officer Login Successful", name: officer.name, role: officer.role });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Production-e React frontend static files serve korar jonno (API routes bad diye)
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});