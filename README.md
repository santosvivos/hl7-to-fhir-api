# HL7 to FHIR Transformation API

A lightweight, high-performance Node.js/Express REST API designed to accept legacy HL7 v2.x (ADT) messages and translate them into modern FHIR JSON resources (STU3/R4).

## 🏥 Clinical Context
As healthcare systems modernize, bridging the gap between legacy localized systems (using pipe-delimited HL7) and modern cloud or API-first solutions (using FHIR JSON) is critical. This microservice demonstrates the parsing, mapping, and routing necessary for building scalable interoperability engines.

## 🚀 Features
- **Raw HL7 Ingestion**: Consumes plain-text `application/hl7-v2` payloads over HTTP POST.
- **Robust Parsing**: Utilizes `hl7-standard` to safely tokenize segments and fields.
- **FHIR Resource Generation**: Maps critical patient demographics (MRN, Name, DOB, Gender) into valid FHIR `Bundle` and `Patient` resources.
- **GUI Testing Interface**: Includes a built-in browser interface to instantly mock and visualize translations.

## 🛠️ Tech Stack
- **Backend Environment**: Node.js
- **Framework**: Express.js
- **Parsing Library**: `hl7-standard`
- **Frontend (Testing)**: Vanilla HTML/CSS/JS

## 🚦 How to Run
1. Clone the repository and run `npm install`
2. Start the server with `npm start` (or `node server.js`)
3. Navigate to `http://localhost:3000` to access the Testing GUI.
4. Or send a POST request with an HL7 body to `http://localhost:3000/api/hl7-to-fhir`
