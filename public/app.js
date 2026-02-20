const hl7Input = document.getElementById('hl7-input');
const fhirOutput = document.getElementById('fhir-output');
const btnTranslate = document.getElementById('btn-translate');
const btnMock = document.getElementById('btn-mock-adt');
const btnCopy = document.getElementById('btn-copy');
const statusDot = document.getElementById('api-status-dot');
const statusText = document.getElementById('api-status-text');

// Realistic Mock ADT^A01 (Admit / Visit Notification)
const mockHL7 = `MSH|^~\\&|EPIC|DEACONESS|HIE|HOSPITAL|20260219143000||ADT^A01|MSG12345|P|2.3
EVN|A01|20260219143000|||JONATHAN^SANTOS
PID|1||10006579^^^MRN||DOE^JOHN^A||19800101|M|||123 MAIN ST^^BELLEVILLE^IL^62220||(314)555-1234|||S||123456789
PV1|1|I|2000^2012^01||||12345^SMITH^JAMES^M||||||||||||1234567890`;

// Load Mock Data
btnMock.addEventListener('click', () => {
    hl7Input.value = mockHL7;
});

// Copy FHIR JSON to Clipboard
btnCopy.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(fhirOutput.textContent);
        showToast('JSON Copied to Clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast('Copy Failed', true);
    }
});

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--accent-red)' : 'white';
    toast.style.color = isError ? 'white' : 'black';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function setApiStatus(status) {
    statusDot.className = 'dot'; // reset
    if (status === 'loading') {
        statusDot.classList.add('loading');
        statusText.textContent = 'Translating...';
    } else if (status === 'error') {
        statusDot.classList.add('error');
        statusText.textContent = 'API Error';
    } else if (status === 'ready') {
        // default green
        statusText.textContent = 'Backend API Ready';
    }
}

// Send HL7 to Backend API
btnTranslate.addEventListener('click', async () => {
    const hl7Data = hl7Input.value.trim();

    if (!hl7Data) {
        showToast('Please enter HL7 data', true);
        return;
    }

    setApiStatus('loading');
    btnTranslate.disabled = true;

    try {
        const response = await fetch('/api/hl7-to-fhir', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: hl7Data
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Syntax or Server Error');
        }

        // Pretty print JSON
        fhirOutput.textContent = JSON.stringify(data, null, 2);
        setApiStatus('ready');

    } catch (error) {
        console.error('Translation Error:', error);
        fhirOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
        setApiStatus('error');
    } finally {
        btnTranslate.disabled = false;
    }
});
