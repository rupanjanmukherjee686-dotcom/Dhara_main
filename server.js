import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Keep database credentials in local .env or Render environment variables.
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

if (!mongoURI) {
    console.warn("MONGODB_URI is not configured; database features are unavailable.");
} else {
    mongoose.connect(mongoURI)
        .then(async () => {
            console.log("MongoDB Atlas Connected Successfully!");
            const defaultOfficer = {
                name: "Rehabilitation & Resettlement Administrator",
                officialId: process.env.RRA_OFFICER_ID || "RRA-ADMIN-001",
                role: "rehabilitation",
                password: process.env.RRA_OFFICER_PASSWORD || "change-this-password"
            };
            const existingOfficer = await Officer.findOne({ officialId: defaultOfficer.officialId });
            if (!existingOfficer) {
                await Officer.create({
                    ...defaultOfficer,
                    password: await bcrypt.hash(defaultOfficer.password, 10)
                });
                console.log(`Default rehabilitation officer created: ${defaultOfficer.officialId}`);
            }
        })
        .catch((err) => console.log("Database connection error: ", err));
}

// ইউজারের জন্য স্কিমা ও মডেল তৈরি
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    reviewChecks: { type: mongoose.Schema.Types.Mixed, default: {} },
    screeningScore: { type: Number, default: 0 },
    screeningLabel: { type: String, default: '' },
    stateRemarks: { type: String, default: '' },
    stateReview: { type: mongoose.Schema.Types.Mixed, default: {} },
    districtReview: { type: mongoose.Schema.Types.Mixed, default: {} },
    fieldVerification: { type: mongoose.Schema.Types.Mixed, default: {} },
    centralReview: { type: mongoose.Schema.Types.Mixed, default: {} },
    landownerAccess: { type: mongoose.Schema.Types.Mixed, default: {} },
    auditTrail: { type: Array, default: [] },
    
    // Forwarding Status
    forwardedToDistrict: { type: Boolean, default: false },
    forwardedToCentral: { type: Boolean, default: false },
    forwardedToRehabilitation: { type: Boolean, default: false },
    rehabilitationReview: { type: mongoose.Schema.Types.Mixed, default: {} },
    rehabilitationDharaId: { type: String, default: '' },

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

function requireDatabase(res) {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: 'Database is not connected. Check the Render MONGODB_URI environment variable.'
        });
        return false;
    }
    return true;
}

app.get('/api/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
        success: connected,
        service: 'dhara-api',
        database: connected ? 'connected' : 'disconnected',
    });
});

// ১. সাইন-আপ (Signup) API রাউট
app.post('/api/signup', async (req, res) => {
    try {
        if (!requireDatabase(res)) return;
        const { name, email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email: normalizedEmail, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ২. সাইন-ইন বা লগইন (Signin) API রাউট
app.post('/api/signin', async (req, res) => {
    try {
        if (!requireDatabase(res)) return;
        const { email, password } = req.body;
        const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
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
            const normalizedEmail = String(email).trim().toLowerCase();
            query = { $or: [{ email: normalizedEmail }, { userEmail: normalizedEmail }] };
        }
        const projects = await Project.find(query);
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

app.get('/api/projects/:projectId', async (req, res) => {
    try {
        const project = await Project.findOne({
            $or: [{ projectId: req.params.projectId }, { id: req.params.projectId }],
        });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

app.post('/api/landowner/access', async (req, res) => {
    try {
        const { dharaId, surveyNumber, accessCode } = req.body;
        const normalizedDharaId = String(dharaId || '').trim().toUpperCase();
        const project = await Project.findOne({
            $or: [
                { projectId: normalizedDharaId },
                { rehabilitationDharaId: normalizedDharaId },
                { 'landownerAccess.dharaId': normalizedDharaId },
            ],
        });
        const access = project?.landownerAccess || {};
        const hasRehabilitationId = project?.rehabilitationDharaId === normalizedDharaId || access.dharaId === normalizedDharaId;
        const surveyMatches = !surveyNumber || !access.surveyNumber || access.surveyNumber === String(surveyNumber).trim().toUpperCase();
        const codeMatches = !accessCode || !access.accessCode || access.accessCode === String(accessCode).trim().toUpperCase();
        if (!project || (!hasRehabilitationId && (!surveyMatches || !codeMatches)) || (hasRehabilitationId && !surveyMatches)) {
            return res.status(401).json({ success: false, message: 'Landowner access details could not be verified.' });
        }
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Landowner access lookup failed.', error: err.message });
    }
});

// ৪. নতুন প্রজেক্ট প্রপোজ বা সেভ করার API
const handleProjectCreation = async (req, res) => {
    try {
        const projectData = req.body;
        
        const existing = await Project.findOne({ projectId: projectData.projectId });
        if (existing) {
            return res.status(200).json({ success: true, message: "Project already exists!", project: existing });
        }

        const newProject = new Project({
            ...projectData,
            userEmail: String(projectData.email || projectData.userEmail || '').trim().toLowerCase(),
            email: String(projectData.email || projectData.userEmail || '').trim().toLowerCase()
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

// 🟢 REHABILITATION PROJECTS FETCH API (UPDATED FOR BETTER MATCHING)
app.get('/api/rehabilitation/projects', async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { forwardedToRehabilitation: true },
                { 
                    stateScrutinyStatus: 'Verified',
                    'fieldVerification.verifiedAt': { $exists: true, $ne: null },
                    'districtReview.verifiedAt': { $exists: true, $ne: null }
                },
                { currentStage: 'Forwarded to Rehabilitation Authority' }
            ],
        }).sort({ _id: -1 });
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Rehabilitation projects could not be loaded.', error: err.message });
    }
});

// ৬. State Scrutiny, Land Bank Status, GIS Flag ebong Forward update korar API (UPDATED LOGIC)
app.put('/api/state/scrutiny/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            stateScrutinyStatus, 
            landBankStatus, 
            gisRequired, 
            actComplianceChecked, 
            reviewChecks,
            screeningScore,
            screeningLabel,
            stateRemarks,
            currentStage,
            forwardedToRehabilitation
        } = req.body;

        const project = await Project.findOne({ projectId: id });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project proposal not found!" });
        }

        project.stateScrutinyStatus = stateScrutinyStatus !== undefined ? stateScrutinyStatus : project.stateScrutinyStatus;
        project.landBankStatus = landBankStatus !== undefined ? landBankStatus : project.landBankStatus;
        project.gisRequired = gisRequired !== undefined ? gisRequired : project.gisRequired;
        project.actComplianceChecked = actComplianceChecked !== undefined ? actComplianceChecked : project.actComplianceChecked;
        project.reviewChecks = reviewChecks !== undefined ? reviewChecks : project.reviewChecks;
        project.screeningScore = screeningScore !== undefined ? screeningScore : project.screeningScore;
        project.screeningLabel = screeningLabel !== undefined ? screeningLabel : project.screeningLabel;
        project.stateRemarks = stateRemarks !== undefined ? stateRemarks : project.stateRemarks;
        project.currentStage = currentStage !== undefined ? currentStage : project.currentStage;

        // 🟢 Rehabilitation forwarding status handling
        if (forwardedToRehabilitation !== undefined) {
            project.forwardedToRehabilitation = forwardedToRehabilitation;
        }

        project.stateReview = {
            ...(project.stateReview || {}),
            status: stateScrutinyStatus,
            officerId: req.body.officerId || project.stateReview?.officerId || '',
            checks: reviewChecks || project.reviewChecks,
            remarks: stateRemarks || project.stateRemarks,
            screeningScore: screeningScore ?? project.screeningScore,
            updatedAt: new Date().toISOString(),
        };
        project.auditTrail.push({
            stage: 'State Scrutiny',
            officerId: req.body.officerId || '',
            status: stateScrutinyStatus,
            at: new Date().toISOString(),
        });

        const fieldAndDistrictVerified = Boolean(
            project.fieldVerification?.verifiedAt &&
            project.districtReview?.verifiedAt
        );

        if (stateScrutinyStatus === 'Verified') {
            project.forwardedToDistrict = true;
            project.forwardedToCentral = true;
            if (forwardedToRehabilitation !== undefined) {
                project.forwardedToRehabilitation = forwardedToRehabilitation;
            } else {
                project.forwardedToRehabilitation = fieldAndDistrictVerified;
            }
            project.status = 'Under Review';
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

app.put('/api/state/return-to-district/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        const returnedAt = new Date().toISOString();
        const officerId = req.body.officerId || 'State Authority';
        project.districtReview = {
            ...(project.districtReview || {}),
            status: 'Review Required',
            remarks: req.body.remarks || 'Additional District review required.',
            returnedBy: officerId,
            returnedAt,
            verifiedAt: null,
        };
        project.forwardedToDistrict = true;
        project.forwardedToCentral = false;
        project.forwardedToRehabilitation = false;
        project.currentStage = 'District Scrutiny';
        project.status = 'District Review Required';
        project.authority = 'District Authority';
        project.auditTrail.push({
            stage: 'State Return to District',
            officerId,
            status: 'Review Required',
            at: returnedAt,
        });
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not return project to District Authority.', error: err.message });
    }
});

app.put('/api/district/verify/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        const { officerId, status = 'Verified', remarks = '', checks = {}, nextStage = 'Field Verification' } = req.body;
        project.districtReview = { officerId, status, remarks, checks, verifiedAt: new Date().toISOString() };
        project.currentStage = nextStage;
        project.status = status === 'Verified' ? 'District Verified' : 'District Review Issue';
        project.authority = nextStage === 'Field Verification' ? 'Field Officer' : status === 'Rejected' ? 'District Authority' : 'Project Authority';
        project.forwardedToDistrict = false;
        project.auditTrail.push({ stage: 'District Review', officerId, status, at: new Date().toISOString() });
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'District verification failed.', error: err.message });
    }
});

app.put('/api/field/verify/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        const { officerId, status = 'Verified', remarks = '', photos = [], coordinates = null } = req.body;
        project.fieldVerification = { officerId, status, remarks, photos, coordinates, verifiedAt: new Date().toISOString() };
        project.currentStage = status === 'Verified' ? 'District Field Review' : 'Company Revision';
        project.status = status === 'Verified' ? 'Field Verification Completed' : 'Field Verification Issue';
        project.authority = status === 'Verified' ? 'District Authority' : 'Project Authority';
        project.auditTrail.push({ stage: 'Field Verification', officerId, status, photoCount: photos.length, at: new Date().toISOString() });
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Field verification failed.', error: err.message });
    }
});

app.put('/api/landowner/consent/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        const percentage = Math.max(0, Math.min(100, Number(req.body.consentPercentage || 0)));
        const noticeEligible = percentage >= 80;
        project.landownerAccess = {
            ...(project.landownerAccess || {}),
            dharaId: project.projectId,
            surveyNumber: project.surveyPlotNumbers || '',
            accessCode: project.landownerAccess?.accessCode || Math.random().toString(36).slice(2, 8).toUpperCase(),
            consentPercentage: percentage,
            offlineNotified: Boolean(req.body.offlineNotified),
            noticeEligible,
            updatedAt: new Date().toISOString(),
        };
        if (noticeEligible) {
            project.noticeToCompany = { issuedBy: req.body.officerId || '', issuedAt: new Date().toISOString(), reason: 'Landowner consent reached 80%' };
            project.auditTrail.push({ stage: 'District Notice to Company', officerId: req.body.officerId || '', status: 'Notice Issued', at: new Date().toISOString() });
        }
        await project.save();
        res.json({ success: true, project, noticeEligible });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Landowner consent update failed.', error: err.message });
    }
});

app.put('/api/rehabilitation/review/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

        const {
            officerId,
            consentPercentage = 0,
            meetingDate = '',
            faceToFaceNotes = '',
            landownerAgreement = 'Pending',
            resettlementPlan = '',
            approveForState = false,
        } = req.body;
        const percentage = Math.max(0, Math.min(100, Number(consentPercentage || 0)));
        const consentReached = percentage >= 80;
        const approvedForState = Boolean(approveForState && consentReached);
        const dharaId = approvedForState
            ? (project.rehabilitationDharaId || `DHARA-RR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`)
            : '';
        const reviewedAt = new Date().toISOString();

        project.rehabilitationReview = {
            officerId: officerId || 'Rehabilitation Authority',
            consentPercentage: percentage,
            meetingDate,
            faceToFaceNotes,
            landownerAgreement: consentReached ? '80% Consent Reached' : landownerAgreement,
            resettlementPlan,
            consentReached,
            approvedForState,
            approvedBy: approvedForState ? (officerId || 'Rehabilitation Authority') : '',
            dharaId: approvedForState ? dharaId : project.rehabilitationDharaId || '',
            reviewedAt,
        };
        if (consentReached) {
            if (approvedForState) {
                project.rehabilitationDharaId = dharaId;
                project.landownerAccess = {
                    ...(project.landownerAccess || {}),
                    dharaId,
                    consentPercentage: percentage,
                    faceToFaceMeetingDate: meetingDate,
                    agreementStatus: '80% Consent Reached',
                    updatedAt: reviewedAt,
                };
            }
            project.currentStage = approvedForState ? 'Rehabilitation Approved for State' : 'Rehabilitation Consent Recorded';
            project.status = approvedForState ? 'R&R Approved for State Review' : 'Rehabilitation Consent Reached';
        }
        project.auditTrail.push({
            stage: 'Rehabilitation & Resettlement',
            officerId: officerId || 'Rehabilitation Authority',
            status: approvedForState ? 'R&R Approved for State' : consentReached ? '80% Consent Reached' : 'Consent Review Updated',
            consentPercentage: percentage,
            dharaId: consentReached ? dharaId : '',
            at: reviewedAt,
        });
        await project.save();
        res.json({ success: true, consentReached, approvedForState, dharaId: approvedForState ? dharaId : '', project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Rehabilitation review failed.', error: err.message });
    }
});

app.get('/api/central/projects', async (req, res) => {
    try {
        const projects = await Project.find({ forwardedToCentral: true }).sort({ _id: -1 });
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Central projects could not be loaded.', error: err.message });
    }
});

app.put('/api/central/review/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
        const { officerId, decision, remarks = '' } = req.body;
        const statusMap = {
            approve: { status: 'Approved for Acquisition', currentStage: 'Acquisition' },
            information: { status: 'Additional Information Required', currentStage: 'Central Oversight' },
            reject: { status: 'Rejected', currentStage: 'Central Rejected' },
        };
        const outcome = statusMap[decision] || statusMap.information;
        project.centralReview = { officerId, decision, remarks, reviewedAt: new Date().toISOString() };
        project.status = outcome.status;
        project.currentStage = outcome.currentStage;
        project.auditTrail.push({ stage: 'Central Oversight', officerId, status: decision, at: new Date().toISOString() });
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Central review failed.', error: err.message });
    }
});

// ৭. অফিসার রেজিস্টার করার API (Normalized input with trimming)
app.post('/api/officer/signup', async (req, res) => {
    try {
        if (!requireDatabase(res)) return;
        const { name, officialId, role, password } = req.body;
        const cleanOfficialId = String(officialId || '').trim();
        const cleanRole = role ? String(role).trim().toLowerCase() : '';

        const existingOfficer = await Officer.findOne({ officialId: cleanOfficialId });
        if (existingOfficer) {
            return res.status(400).json({ success: false, message: "Officer already exists with this ID!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newOfficer = new Officer({ name, officialId: cleanOfficialId, role: cleanRole, password: hashedPassword });
        await newOfficer.save();
        res.status(201).json({ success: true, message: "Officer registered successfully in database!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// ৮. অফিসার সাইন-ইন API (Added robust trimming and case-insensitivity for safety)
app.post('/api/officer/signin', async (req, res) => {
    try {
        if (!requireDatabase(res)) return;
        const { officialId, password, role } = req.body;
        const cleanOfficialId = String(officialId || '').trim();
        const cleanRole = role ? String(role).trim().toLowerCase() : null;

        const officer = await Officer.findOne({ officialId: cleanOfficialId });
        if (!officer) {
            return res.status(401).json({ success: false, message: "Invalid Government ID!" });
        }
        if (cleanRole && officer.role !== cleanRole) {
            return res.status(401).json({ success: false, message: `You are not authorized for the ${role} portal!` });
        }
        let isPasswordValid = false;
        if (officer.password && officer.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, officer.password);
        } else {
            isPasswordValid = (password === officer.password);
        }
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid Password!" });
        }
        res.json({ success: true, message: "Officer Login Successful", name: officer.name, role: officer.role });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
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