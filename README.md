# Integrating With HubSpot I: Foundations — Practicum

Node.js and Express application that reads and writes records of a HubSpot
custom object called **NFL Team** through the CRM API, and renders them with
Pug templates.

## Custom object list view

https://app.hubspot.com/contacts/52021802/objects/2-69179296/views/all/list

## The custom object

| Property        | Internal name     | Type        | Notes                    |
| --------------- | ----------------- | ----------- | ------------------------ |
| Name            | `name`            | string      | Primary display property |
| Conference      | `conference`      | enumeration | `AFC` or `NFC`           |
| Home Stadium    | `home_stadium`    | string      |                          |
| Founded Year    | `founded_year`    | number      |                          |
| Super Bowl Wins | `super_bowl_wins` | number      |                          |

The object is associated with the standard **Contacts** object type.

## Routes

| Method | Route           | What it does                                                          |
| ------ | --------------- | --------------------------------------------------------------------- |
| `GET`  | `/`             | Retrieves every NFL Team record and renders them in an HTML table.     |
| `GET`  | `/update-cobj`  | Renders the form used to create a new record.                          |
| `POST` | `/update-cobj`  | Creates the record in HubSpot and redirects back to the homepage.      |

## Project structure

```
├── index.js                  Express app and the three routes
├── scripts/
│   ├── create-object.js      Creates the custom object schema and properties
│   └── seed-records.js       Loads the three starter records
├── views/
│   ├── layout.pug            Shared page shell
│   ├── homepage.pug          Table of records
│   ├── updates.pug           Create-record form
│   ├── error.pug             Friendly error page
│   └── contacts.pug          Sample template from the starter repo (reference)
├── public/css/style.css
├── .env.example
└── package.json
```

## Setup

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a private app in your HubSpot developer test account with these
   scopes, and copy its access token:

   - `crm.schemas.custom` (read and write)
   - `crm.objects.custom` (read and write)
   - `crm.objects.contacts` (read and write)

3. Copy `.env.example` to `.env` and add your token:

   ```bash
   cp .env.example .env
   ```

   > `.env` is git-ignored. The access token must never be committed.

4. Add the `objectTypeId` of the custom object to `.env` as `OBJECT_TYPE_ID`.
   You can read it from the URL of the object's list view in HubSpot.

   The **NFL Team** custom object used here was created through the HubSpot UI,
   along with its properties and the association to Contacts. To recreate it
   from scratch in a different account, `scripts/create-object.js` does the same
   thing through the CRM schemas API and prints the generated `objectTypeId`:

   ```bash
   npm run setup:object
   ```

5. Load the starter records:

   ```bash
   npm run setup:records
   ```

6. Start the app and open <http://localhost:3000>:

   ```bash
   npm start
   ```

## Tech stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [Pug](https://pugjs.org/)
- [dotenv](https://www.npmjs.com/package/dotenv)