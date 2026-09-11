import 'dotenv/config';
import jwt from 'jsonwebtoken';

const SECURITY_LAYER_URL =
    process.env.SECURITY_LAYER_URL ||
    'http://localhost:5001';

const SECURITY_SERVICE_SECRET =
    process.env.SECURITY_SERVICE_SECRET;

// =====================================================
// Security layer health check
// =====================================================

export async function securityHealthCheck() {
    const response = await fetch(
        `${SECURITY_LAYER_URL}/api/health`
    );

    if (!response.ok) {
        throw new Error(
            `Security layer returned HTTP ${response.status}`
        );
    }

    return response.json();
}

// =====================================================
// Create DHARA Main service JWT
// =====================================================

export function createSecurityServiceToken() {
    if (!SECURITY_SERVICE_SECRET) {
        throw new Error(
            'SECURITY_SERVICE_SECRET is missing from .env'
        );
    }

    return jwt.sign(
        {
            type: 'dhara_main_service',
            service: 'dhara_main'
        },

        SECURITY_SERVICE_SECRET,

        {
            expiresIn: '5m'
        }
    );
}

// =====================================================
// Verify document through Trust & Security Layer
// =====================================================

export async function verifyDocument(
    documentId
) {
    const token =
        createSecurityServiceToken();

    const response = await fetch(
        `${SECURITY_LAYER_URL}/api/documents/service/${encodeURIComponent(
            documentId
        )}/verify`,

        {
            method: 'GET',

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            `Security layer returned HTTP ${response.status}`
        );
    }

    return data;
}

// =====================================================
// Create secure document
//
// NOTE:
// This currently requires a human user's signing
// private key. We are NOT connecting this to the
// normal DHARA project workflow yet.
// =====================================================

export async function createSecureDocument({
    documentId,
    resourceType,
    content,
    privateKey,
    storeContent = false,
    token
}) {
    if (!documentId) {
        throw new Error(
            'documentId is required'
        );
    }

    if (!resourceType) {
        throw new Error(
            'resourceType is required'
        );
    }

    if (!content) {
        throw new Error(
            'content is required'
        );
    }

    if (!privateKey) {
        throw new Error(
            'privateKey is required'
        );
    }

    if (!token) {
        throw new Error(
            'Security-layer authentication token is required'
        );
    }

    const response = await fetch(
        `${SECURITY_LAYER_URL}/api/documents`,

        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json',

                Authorization:
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                documentId,
                resourceType,
                content,
                privateKey,
                storeContent
            })
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            `Security layer returned HTTP ${response.status}`
        );
    }

    return data;
}

// =====================================================
// Test DHARA Main service authentication
// =====================================================

export async function testSecurityServiceAuth() {
    const token =
        createSecurityServiceToken();

    const response = await fetch(
        `${SECURITY_LAYER_URL}/api/service/ping`,

        {
            method: 'GET',

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            `Security layer returned HTTP ${response.status}`
        );
    }

    return data;
}