// -----------------------------------------------------------------------------
// Integrating With HubSpot I: Foundations - Practicum
//
// Express app that reads and writes records of the "NFL Team" custom object
// through the HubSpot CRM API.
// -----------------------------------------------------------------------------

const express = require('express');
const axios = require('axios');
require('dotenv').config();

// --- Environment -------------------------------------------------------------
const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_TOKEN;
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;
const PORT = process.env.PORT || 3000;

if (!PRIVATE_APP_TOKEN || !OBJECT_TYPE_ID) {
    console.error('Missing PRIVATE_APP_TOKEN or OBJECT_TYPE_ID. Copy .env.example to .env first.');
    process.exit(1);
}

// Custom properties handled by the app, in the order they appear on screen.
const TEAM_PROPERTIES = ['name', 'conference', 'home_stadium', 'founded_year', 'super_bowl_wins'];

// --- HubSpot client ----------------------------------------------------------
// A single pre-configured axios instance keeps the base URL and the auth header
// in one place instead of repeating them on every call.
const hubspot = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
        Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// Every request in this app targets the same custom object endpoint.
const OBJECT_ENDPOINT = `/crm/v3/objects/${OBJECT_TYPE_ID}`;

/**
 * Retrieves every NFL Team record with all of its custom properties.
 */
async function getTeams() {
    const { data } = await hubspot.get(OBJECT_ENDPOINT, {
        params: {
            limit: 100,
            properties: TEAM_PROPERTIES.join(','),
        },
    });

    return data.results;
}

/**
 * Creates a single NFL Team record from the submitted form data.
 * Empty fields are dropped so HubSpot does not receive blank values, and the
 * two numeric properties are converted from strings before being sent.
 */
async function createTeam(formData) {
    const properties = {};

    TEAM_PROPERTIES.forEach((property) => {
        const value = formData[property];

        if (value === undefined || value === '') {
            return;
        }

        const isNumeric = property === 'founded_year' || property === 'super_bowl_wins';
        properties[property] = isNumeric ? Number(value) : value;
    });

    const { data } = await hubspot.post(OBJECT_ENDPOINT, { properties });

    return data;
}

/**
 * Logs the useful part of an axios error and answers with a readable message.
 */
function handleError(res, error, message) {
    console.error(message, error.response ? error.response.data : error.message);
    res.status(500).render('error', { title: 'Something went wrong', message });
}

// --- App configuration -------------------------------------------------------
const app = express();

// Both paths are anchored to this file so the app also runs when node is
// started from a different working directory.
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// GET "/" - Homepage
// Reads every custom object record and renders them as an HTML table.
// -----------------------------------------------------------------------------
app.get('/', async (req, res) => {
    try {
        const teams = await getTeams();

        res.render('homepage', {
            title: 'NFL Teams | Integrating With HubSpot I Practicum',
            teams,
        });
    } catch (error) {
        handleError(res, error, 'Could not retrieve the NFL Team records from HubSpot.');
    }
});

// -----------------------------------------------------------------------------
// GET "/update-cobj" - Form
// Renders the template that holds the HTML form used to create a new record.
// -----------------------------------------------------------------------------
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
    });
});

// -----------------------------------------------------------------------------
// POST "/update-cobj" - Create
// Sends the form data to HubSpot and redirects back to the homepage so the new
// record shows up in the table.
// -----------------------------------------------------------------------------
app.post('/update-cobj', async (req, res) => {
    try {
        await createTeam(req.body);
        res.redirect('/');
    } catch (error) {
        handleError(res, error, 'Could not create the NFL Team record in HubSpot.');
    }
});

// --- Server ------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});
