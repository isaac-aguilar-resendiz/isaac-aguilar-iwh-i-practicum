// -----------------------------------------------------------------------------
// One-time setup script.
//
// Creates the "NFL Team" custom object schema in the connected HubSpot test
// account, together with its custom properties and the association to Contacts.
//
// Run it once with:  node scripts/create-object.js
// It prints the objectTypeId you need to put in your .env file.
// -----------------------------------------------------------------------------

const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.PRIVATE_APP_TOKEN;

if (!TOKEN) {
    console.error('Missing PRIVATE_APP_TOKEN. Copy .env.example to .env and fill it in.');
    process.exit(1);
}

const hubspot = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// Schema definition. "name" is the required string property and is also used as
// the primary display property for the object.
const schema = {
    name: 'nfl_team',
    labels: {
        singular: 'NFL Team',
        plural: 'NFL Teams',
    },
    primaryDisplayProperty: 'name',
    secondaryDisplayProperties: ['conference', 'home_stadium'],
    requiredProperties: ['name'],
    searchableProperties: ['name', 'home_stadium'],
    properties: [
        {
            name: 'name',
            label: 'Name',
            type: 'string',
            fieldType: 'text',
        },
        {
            name: 'conference',
            label: 'Conference',
            type: 'enumeration',
            fieldType: 'select',
            options: [
                { label: 'AFC', value: 'AFC', displayOrder: 0 },
                { label: 'NFC', value: 'NFC', displayOrder: 1 },
            ],
        },
        {
            name: 'home_stadium',
            label: 'Home Stadium',
            type: 'string',
            fieldType: 'text',
        },
        {
            name: 'founded_year',
            label: 'Founded Year',
            type: 'number',
            fieldType: 'number',
        },
        {
            name: 'super_bowl_wins',
            label: 'Super Bowl Wins',
            type: 'number',
            fieldType: 'number',
        },
    ],
    // Associates the custom object with the standard Contacts object type.
    associatedObjects: ['CONTACT'],
};

async function createObject() {
    try {
        const { data } = await hubspot.post('/crm/v3/schemas', schema);

        console.log('Custom object created.');
        console.log('objectTypeId        :', data.objectTypeId);
        console.log('fullyQualifiedName  :', data.fullyQualifiedName);
        console.log('');
        console.log('Add this line to your .env file:');
        console.log(`OBJECT_TYPE_ID=${data.objectTypeId}`);
    } catch (error) {
        const details = error.response ? error.response.data : error.message;
        console.error('Could not create the custom object:');
        console.error(details);
        process.exit(1);
    }
}

createObject();
