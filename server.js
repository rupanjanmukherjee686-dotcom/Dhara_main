import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    createSecurityServiceToken
} from './utils/securityClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// =====================================================
// Configuration
// =====================================================

const mongoURI = process.env.MONGO_URI;

const SECURITY_LAYER_URL =
    process.env.SECURITY_LAYER_URL ||
    'http://localhost:5001';

if (!mongoURI) {
    console.error(
        'MONGO_URI is missing from .env'
    );
    process.exit(1);
}

if (!process.env.SECURITY_SERVICE_SECRET) {
    console.error(
        'SECURITY_SERVICE_SECRET is missing from .env'
    );
    process.exit(1);
}

// =====================================================
// MongoDB Atlas connection
// =====================================================

mongoose.connect(mongoURI)
    .then(() => {
        console.log(
            'MongoDB Atlas Connected Successfully!'
        );
    })
    .catch((err) => {
        console.error(
            'Database connection error:',
            err.message
        );

        process.exit(1);
    });

// =====================================================
// User Schema
// =====================================================

const userSchema = new mongoose.Schema({
    name: String,

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    resetOtpHash: String,

    resetOtpExpiresAt: Date
});

const User = mongoose.model(
    'User',
    userSchema
);

// =====================================================
// Officer Schema
// =====================================================

const officerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    officialId: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
});

const Officer = mongoose.model(
    'Officer',
    officerSchema
);

// =====================================================
// Project Schema
// =====================================================

const projectSchema = new mongoose.Schema(
    {
        userEmail: String,
        email: String,

        projectId: {
            type: String,
            required: true,
            unique: true
        },

        projectName: String,
        title: String,

        // -----------------------------
        // Status & stages
        // -----------------------------

        status: {
            type: String,
            default: 'Pending'
        },

        currentStage: {
            type: String,
            default: 'Proposal Submitted'
        },

        // -----------------------------
        // State scrutiny
        // -----------------------------

        stateScrutinyStatus: {
            type: String,
            default: 'Pending'
        },

        landBankStatus: {
            type: String,
            default: 'Unchecked'
        },

        gisRequired: {
            type: Boolean,
            default: false
        },

        actComplianceChecked: {
            type: Boolean,
            default: false
        },

        reviewChecks: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        screeningScore: {
            type: Number,
            default: 0
        },

        screeningLabel: {
            type: String,
            default: ''
        },

        stateRemarks: {
            type: String,
            default: ''
        },

        // -----------------------------
        // Forwarding
        // -----------------------------

        forwardedToDistrict: {
            type: Boolean,
            default: false
        },

        forwardedToCentral: {
            type: Boolean,
            default: false
        },

        // -----------------------------
        // Company & land details
        // -----------------------------

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
    },
    {
        strict: false
    }
);

const Project = mongoose.model(
    'Project',
    projectSchema
);

// =====================================================
// User Signup
// =====================================================

app.post(
    '/api/signup',
    async (req, res) => {
        try {
            const {
                name,
                email,
                password
            } = req.body;

            const normalizedEmail =
                String(email || '')
                    .trim()
                    .toLowerCase();

            const existingUser =
                await User.findOne({
                    email: normalizedEmail
                });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message:
                        'User already exists with this email!'
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const newUser = new User({
                name,
                email: normalizedEmail,
                password: hashedPassword
            });

            await newUser.save();

            res.status(201).json({
                success: true,
                message:
                    'User registered successfully!'
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: err.message
            });
        }
    }
);

// =====================================================
// User Signin
// =====================================================

app.post(
    '/api/signin',
    async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            const user = await User.findOne({
                email: String(email || '')
                    .trim()
                    .toLowerCase()
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        'You are not authorized!'
                });
            }

            const isPasswordValid =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message:
                        'Invalid Password!'
                });
            }

            res.json({
                success: true,
                message: 'Login Successful',
                name: user.name,
                email: user.email
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// =====================================================
// Password Reset Request
// =====================================================

app.post(
    '/api/password-reset/request',
    async (req, res) => {
        try {
            const email =
                String(req.body.email || '')
                    .trim()
                    .toLowerCase();

            const user =
                await User.findOne({
                    email
                });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        'No authorized account exists for this email.'
                });
            }

            res.json({
                success: true,
                message:
                    'Password reset request received.'
            });

        } catch (err) {
            console.error(
                'Password reset request failed:',
                err
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to process password reset request.'
            });
        }
    }
);

// =====================================================
// Projects: Fetch
// =====================================================

app.get(
    '/api/projects',
    async (req, res) => {
        try {
            const email = req.query.email;

            let query = {};

            if (email) {
                query = {
                    $or: [
                        { email },
                        { userEmail: email }
                    ]
                };
            }

            const projects =
                await Project.find(query);

            res.json({
                success: true,
                projects
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: err.message
            });
        }
    }
);

// =====================================================
// Project Creation
// =====================================================

const handleProjectCreation =
    async (req, res) => {
        try {
            const projectData = req.body;

            const existing =
                await Project.findOne({
                    projectId:
                        projectData.projectId
                });

            if (existing) {
                return res.status(200).json({
                    success: true,
                    message:
                        'Project already exists!',
                    project: existing
                });
            }

            const newProject =
                new Project({
                    ...projectData,

                    userEmail:
                        projectData.email ||
                        projectData.userEmail
                });

            await newProject.save();

            res.status(201).json({
                success: true,
                message:
                    'Project proposal saved successfully!',
                project: newProject
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: err.message
            });
        }
    };

app.post(
    '/api/projects',
    handleProjectCreation
);

app.post(
    '/api/proposals',
    handleProjectCreation
);

// =====================================================
// State Proposals
// =====================================================

app.get(
    '/api/state/proposals',
    async (req, res) => {
        try {
            const proposals =
                await Project.find({})
                    .sort({ _id: -1 });

            res.json({
                success: true,
                proposals
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// =====================================================
// State Scrutiny / GIS / Forwarding
// =====================================================

app.put(
    '/api/state/scrutiny/:id',
    async (req, res) => {
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
                currentStage
            } = req.body;

            const project =
                await Project.findOne({
                    projectId: id
                });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Project proposal not found!'
                });
            }

            if (
                stateScrutinyStatus !==
                undefined
            ) {
                project.stateScrutinyStatus =
                    stateScrutinyStatus;
            }

            if (
                landBankStatus !==
                undefined
            ) {
                project.landBankStatus =
                    landBankStatus;
            }

            if (
                gisRequired !==
                undefined
            ) {
                project.gisRequired =
                    gisRequired;
            }

            if (
                actComplianceChecked !==
                undefined
            ) {
                project.actComplianceChecked =
                    actComplianceChecked;
            }

            if (
                reviewChecks !==
                undefined
            ) {
                project.reviewChecks =
                    reviewChecks;
            }

            if (
                screeningScore !==
                undefined
            ) {
                project.screeningScore =
                    screeningScore;
            }

            if (
                screeningLabel !==
                undefined
            ) {
                project.screeningLabel =
                    screeningLabel;
            }

            if (
                stateRemarks !==
                undefined
            ) {
                project.stateRemarks =
                    stateRemarks;
            }

            if (
                currentStage !==
                undefined
            ) {
                project.currentStage =
                    currentStage;
            }

            if (
                stateScrutinyStatus ===
                'Verified'
            ) {
                project.forwardedToDistrict =
                    true;

                project.forwardedToCentral =
                    true;

                project.status =
                    'Under District & Central Review';

                project.currentStage =
                    'Forwarded to District & Central';
            }

            await project.save();

            res.json({
                success: true,
                message:
                    'State scrutiny and forwarding updated successfully!',
                project
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// =====================================================
// Officer Signup
// =====================================================

app.post(
    '/api/officer/signup',
    async (req, res) => {
        try {
            const {
                name,
                officialId,
                role,
                password
            } = req.body;

            const existingOfficer =
                await Officer.findOne({
                    officialId
                });

            if (existingOfficer) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Officer already exists with this ID!'
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const newOfficer =
                new Officer({
                    name,
                    officialId,
                    role,
                    password: hashedPassword
                });

            await newOfficer.save();

            res.status(201).json({
                success: true,
                message:
                    'Officer registered successfully in database!'
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// =====================================================
// Officer Signin
// =====================================================

app.post(
    '/api/officer/signin',
    async (req, res) => {
        try {
            const {
                officialId,
                password,
                role
            } = req.body;

            const officer =
                await Officer.findOne({
                    officialId
                });

            if (!officer) {
                return res.status(401).json({
                    success: false,
                    message:
                        'Invalid Government ID!'
                });
            }

            if (
                role &&
                officer.role !== role
            ) {
                return res.status(401).json({
                    success: false,
                    message:
                        `You are not authorized for the ${role} portal!`
                });
            }

            let isPasswordValid = false;

            if (
                officer.password.startsWith(
                    '$2b$'
                )
            ) {
                isPasswordValid =
                    await bcrypt.compare(
                        password,
                        officer.password
                    );
            } else {
                isPasswordValid =
                    password ===
                    officer.password;
            }

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message:
                        'Invalid Password!'
                });
            }

            res.json({
                success: true,
                message:
                    'Officer Login Successful',
                name: officer.name,
                role: officer.role
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// =====================================================
// DHARA → Trust & Security health bridge
// =====================================================

app.get(
    '/api/security/health',
    async (req, res) => {
        try {
            const response =
                await fetch(
                    `${SECURITY_LAYER_URL}/api/health`
                );

            const data =
                await response.json();

            res.status(
                response.status
            ).json({
                success:
                    response.ok,

                securityLayer:
                    data
            });

        } catch (err) {
            console.error(
                'Security layer connection failed:',
                err.message
            );

            res.status(503).json({
                success: false,
                message:
                    'Trust & Security Layer is unavailable',
                error:
                    err.message
            });
        }
    }
);

// =====================================================
// DHARA project integrity check
// =====================================================

app.get(
    '/api/projects/:projectId/security-check',
    async (req, res) => {
        try {
            const {
                projectId
            } = req.params;

            const project =
                await Project.findOne({
                    projectId
                });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Project not found'
                });
            }

            const serviceToken =
                createSecurityServiceToken();

            const securityResponse =
                await fetch(
                    `${SECURITY_LAYER_URL}/api/documents/service/${encodeURIComponent(
                        projectId
                    )}/verify`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${serviceToken}`
                        }
                    }
                );

            const securityData =
                await securityResponse.json();

            if (!securityResponse.ok) {
                return res.status(
                    securityResponse.status
                ).json({
                    success: false,
                    projectId,
                    security:
                        securityData
                });
            }

            res.json({
                success: true,
                projectId,
                security:
                    securityData
            });

        } catch (err) {
            console.error(
                'Project security check failed:',
                err.message
            );

            res.status(503).json({
                success: false,
                message:
                    'Trust & Security Layer is unavailable',
                error:
                    err.message
            });
        }
    }
);

// =====================================================
// Serve React frontend
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            'dist'
        )
    )
);

// Don't intercept API routes
app.get(
    /^\/(?!api).*/,
    (req, res) => {
        res.sendFile(
            path.resolve(
                __dirname,
                'dist',
                'index.html'
            )
        );
    }
);

// =====================================================
// Start server
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    }
);