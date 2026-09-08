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
    role: { type: String, required: true },
    password: { type: String, required: true }
});
const Officer = mongoose.model('Officer', officerSchema);

// প্রজেক্টের জন্য আপডেট করা স্কিমা ও মডেল (State Scrutiny, Land Bank & GIS support সহ)
const projectSchema = new mongoose.Schema({
    userEmail: { type: String }, 
    email: { type: String }, 
    projectId: { type: String, required: true, unique: true },
    projectName: { type: String },
    title: { type: String },
    
    // Status & Stages
    status: { type: String, default: 'Pending' },
    currentStage: { type: String, default: 'Proposal Submitted' }, // Proposal Submitted -> State Scrutiny -> District/Central
    
    // State Scrutiny & Land Bank Fields
    stateScrutinyStatus: { type: String, default: 'Pending' }, // Pending, Verified, Rejected
    landBankStatus: { type: String, default: 'Unchecked' },   // Available, Not Found
    gisRequired: { type: Boolean, default: false },            // True hobe jodi Land Bank-e jomi na paoya jay
    actComplianceChecked: { type: Boolean, default: false },   // LARR Act 2013 & WB Land Reforms Act compliance
    stateRemarks: { type: String, default: '' },
    
    // Forwarding Status
    forwardedToDistrict: { type: Boolean, default: false },
    forwardedToCentral: { type: Boolean, default: false },

    // Company & Land Details
    companyName: String,
    companyRegistrationNumber: String,
    registeredAddress: String,
    authorizedPersonName: String,
    designation: String,
    phoneNumber: String,
    projectType: String,
    detailedProjectDescription: String,
    estimatedProjectCost: String,
    expectedEmploymentGeneration: String,
    projectStartDate: String,
    expectedCompletionDate: String,
    totalLandRequired: String,
    landUnit: String,
    preferredState: String,
    district: String,
    blockTehsil: String,
    villageMouza: String,
    surveyPlotNumbers: String,
    agriculturalStatus: String,
    irrigationStatus: String,
    cropStatus: String,
    acquisitionPurpose: String,
    whyParticularLocation: String,
    requiredPossessionDate: String,
    compensationFundingDetails: String,
    documents: Array,
    submittedAt: String
}, { strict: false });

const Project = mongoose.model('Project', projectSchema);

// ১. সাইন-আপ (Signup) API রাউট
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

// ২. সাইন-ইন বা লগইন (Signin) API রাউট
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
        res.json({ success: true, message: "Login Successful", name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ৩. প্রজেক্ট ফেচ (Fetch) করার API
app.get('/api/projects', async (req, res) => {
    try {
        const email = req.query.email;
        let query = {};
        if (email) {
            query = { $or: [{ email: email }, { userEmail: email }] };
        }
        const projects = await Project.find(query);
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ৪. নতুন প্রজেক্ট প্রপোজ বা সেভ করার API (/api/projects ebong /api/proposals)
const handleProjectCreation = async (req, res) => {
    try {
        const projectData = req.body;
        
        const existing = await Project.findOne({ projectId: projectData.projectId });
        if (existing) {
            return res.status(200).json({ success: true, message: "Project already exists!", project: existing });
        }

        const newProject = new Project({
            ...projectData,
            userEmail: projectData.email || projectData.userEmail
        });

        await newProject.save();
        res.status(201).json({ success: true, message: "Project proposal saved successfully!", project: newProject });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

app.post('/api/projects', handleProjectCreation);
app.post('/api/proposals', handleProjectCreation);

// ৫. State Officer-der jonno sob pending proposals fetch korar API
app.get('/api/state/proposals', async (req, res) => {
    try {
        const proposals = await Project.find({}).sort({ _id: -1 });
        res.json({ success: true, proposals });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ৬. State Scrutiny, Land Bank Status, GIS Flag ebong Forward update korar API
app.put('/api/state/scrutiny/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            stateScrutinyStatus, 
            landBankStatus, 
            gisRequired, 
            actComplianceChecked, 
            stateRemarks,
            currentStage 
        } = req.body;

        const project = await Project.findOne({ projectId: id });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project proposal not found!" });
        }

        project.stateScrutinyStatus = stateScrutinyStatus !== undefined ? stateScrutinyStatus : project.stateScrutinyStatus;
        project.landBankStatus = landBankStatus !== undefined ? landBankStatus : project.landBankStatus;
        project.gisRequired = gisRequired !== undefined ? gisRequired : project.gisRequired;
        project.actComplianceChecked = actComplianceChecked !== undefined ? actComplianceChecked : project.actComplianceChecked;
        project.stateRemarks = stateRemarks !== undefined ? stateRemarks : project.stateRemarks;
        project.currentStage = currentStage !== undefined ? currentStage : project.currentStage;

        // Jodi state scrutiny verified hoy, tahole automatic District ebong Central-er kache forward kore dewa
        if (stateScrutinyStatus === 'Verified') {
            project.forwardedToDistrict = true;
            project.forwardedToCentral = true;
            project.status = 'Under District & Central Review';
            project.currentStage = 'Forwarded to District & Central';
        }

        await project.save();
        res.json({ 
            success: true, 
            message: "State scrutiny and forwarding updated successfully!", 
            project 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ৭. অফিসার রেজিস্টার করার API
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

// ৮. অফিসার সাইন-ইন API
app.post('/api/officer/signin', async (req, res) => {
    try {
        const { officialId, password, role } = req.body;
        const officer = await Officer.findOne({ officialId });
        if (!officer) {
            return res.status(401).json({ success: false, message: "Invalid Government ID!" });
        }
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

// Production-e React frontend static files serve korar jonno
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
