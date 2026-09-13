// -----------------------------------------------------------------------------
// One-time setup script.
//
// Loads the three starter NFL Team records required by the practicum.
// Run it after create-object.js, once OBJECT_TYPE_ID is set in your .env file:
//
//   node scripts/seed-records.js
// -----------------------------------------------------------------------------

const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.PRIVATE_APP_TOKEN;
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;

if (!TOKEN || !OBJECT_TYPE_ID) {
    console.error('Missing PRIVATE_APP_TOKEN or OBJECT_TYPE_ID. Check your .env file.');
    process.exit(1);
}

const hubspot = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// Figures are current through Super Bowl LX (February 2026).
const teams = [
    {
        name: 'Pittsburgh Steelers',
        conference: 'AFC',
        home_stadium: 'Acrisure Stadium',
        founded_year: 1933,
        super_bowl_wins: 6,
    },
    {
        name: 'Green Bay Packers',
        conference: 'NFC',
        home_stadium: 'Lambeau Field',
        founded_year: 1919,
        super_bowl_wins: 4,
    },
    {
        name: 'Seattle Seahawks',
        conference: 'NFC',
        home_stadium: 'Lumen Field',
        founded_year: 1974,
        super_bowl_wins: 2,
    },
];

async function seedRecords() {
    for (const team of teams) {
        try {
            await hubspot.post(`/crm/v3/objects/${OBJECT_TYPE_ID}`, { properties: team });
            console.log(`Created: ${team.name}`);
        } catch (error) {
            const details = error.response ? error.response.data : error.message;
            console.error(`Failed to create ${team.name}:`, details);
        }
    }
}

seedRecords();
