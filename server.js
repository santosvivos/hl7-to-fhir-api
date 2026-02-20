const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const HL7 = require('hl7-standard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// We need to handle plain text for HL7 payloads
app.use(bodyParser.text({ type: ['text/plain', 'application/hl7-v2'] }));
// We need json for any standard JSON requests
app.use(express.json());
// Serve static files for our Testing Interface
app.use(express.static(path.join(__dirname, 'public')));

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HL7 to FHIR API is running' });
});

// Main API endpoint for translating HL7 to FHIR
app.post('/api/hl7-to-fhir', (req, res) => {
    try {
        const hl7Message = req.body;

        if (!hl7Message || typeof hl7Message !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing HL7 message body. Please send plain text HL7 data.' });
        }

        console.log('--- Incoming HL7 Message ---');
        console.log(hl7Message.substring(0, 100) + '...'); // Log preview

        // Parse HL7 using the hl7-standard library
        let hl7 = new HL7(hl7Message);
        hl7.transform(); // build the HL7 object

        // Extracting standard ADT data from PID (Patient Identification) segment
        // PID.3 is usually patient ID list, we'll take the primary ID
        const mrn = hl7.get('PID.3.1') || 'UNKNOWN-MRN';

        // PID.5 is Patient Name (Last^First)
        const lastName = hl7.get('PID.5.1') || 'UNKNOWN';
        const firstName = hl7.get('PID.5.2') || 'UNKNOWN';

        // PID.7 is Date of Birth (YYYYMMDD)
        const dobRaw = hl7.get('PID.7.1') || hl7.get('PID.7') || '';
        let dobFhir = null;
        if (dobRaw && dobRaw.length >= 8) {
            dobFhir = `${dobRaw.substring(0, 4)}-${dobRaw.substring(4, 6)}-${dobRaw.substring(6, 8)}`;
        }

        // PID.8 is Administrative Sex
        const genderRaw = hl7.get('PID.8');
        let genderFhir = 'unknown';
        if (genderRaw === 'M') genderFhir = 'male';
        else if (genderRaw === 'F') genderFhir = 'female';
        else if (genderRaw === 'O') genderFhir = 'other';

        // Construct FHIR Bundle containing a Patient resource
        const fhirBundle = {
            resourceType: "Bundle",
            type: "message",
            meta: {
                lastUpdated: new Date().toISOString()
            },
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        identifier: [
                            {
                                use: "usual",
                                type: {
                                    coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" }]
                                },
                                value: mrn
                            }
                        ],
                        name: [
                            {
                                use: "official",
                                family: lastName,
                                given: [firstName]
                            }
                        ],
                        gender: genderFhir,
                        ...(dobFhir && { birthDate: dobFhir }) // Only include if exists
                    }
                }
            ]
        };

        res.json(fhirBundle);
    } catch (error) {
        console.error('Error processing HL7 message:', error);
        res.status(500).json({ error: 'Internal server error while processing HL7 message' });
    }
});

app.listen(PORT, () => {
    console.log('=============================================');
    console.log(`🚀 HL7 to FHIR API server running on port ${PORT}`);
    console.log(`💻 GUI Testing Interface: http://localhost:${PORT}`);
    console.log(`🔌 API Endpoint (POST):   http://localhost:${PORT}/api/hl7-to-fhir`);
    console.log('=============================================');
});
