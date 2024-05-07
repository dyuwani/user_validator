document.getElementById('validateButton').addEventListener('click', function() {
    // Get data from input forms
    const correctListData = parseData(document.querySelector('#correctListForm textarea').value);
    const snowData = parseData(document.querySelector('#snowForm textarea').value);
    const salesforceData = parseData(document.querySelector('#salesforceForm textarea').value);
    const myPortalData = parseData(document.querySelector('#myPortalForm textarea').value);

    // Perform validation
    const validationResults = validateData(correctListData, snowData, salesforceData, myPortalData);

    // Display validation results
    displayValidationResults(validationResults);
});

function parseData(dataString) {
    // Parse the data string into an array of objects
    const lines = dataString.split('\n');
    const data = [];
    lines.forEach(line => {
        const values = line.split(',');
        const obj = {
            name: values[0]?.trim(),
            email: values[1]?.trim(),
            businessPhone: values[2]?.trim(),
            mobile: values[3]?.trim()
        };
        data.push(obj);
    });
    return data;
}

function validateData(correctListData, snowData, salesforceData, myPortalData) {
    const validationResults = {
        userInAllSystems: [],
        correctListInAll: true,
        correctListIn: [],
        incorrectData: {},
        extraNames: {
            snow: [],
            salesforce: [],
            myPortal: [],
            correctListNotIn: {
                snow: [],
                salesforce: [],
                myPortal: []
            }
        }
    };

    // Validate names in the correct list
    correctListData.forEach(correctEntry => {
        const name = correctEntry.name;
        const snowEntry = snowData.find(entry => entry.name === name);
        const salesforceEntry = salesforceData.find(entry => entry.name === name);
        const myPortalEntry = myPortalData.find(entry => entry.name === name);

        if (snowEntry && salesforceEntry && myPortalEntry) {
            // Name found in all sources
            validationResults.userInAllSystems.push(name);
            validationResults.correctListIn.push(name);
            
            // Validate email, business phone, and mobile number
            const emailValidation = validateEmail(correctEntry.email);
            if (emailValidation !== true) {
                validationResults.incorrectData[name] = emailValidation;
            }
            const businessPhoneValidation = validatePhoneNumber(correctEntry.businessPhone, 'Business Phone');
            if (businessPhoneValidation !== true) {
                validationResults.incorrectData[name] = businessPhoneValidation;
            }
            const mobileValidation = validatePhoneNumber(correctEntry.mobile, 'Mobile');
            if (mobileValidation !== true) {
                validationResults.incorrectData[name] = mobileValidation;
            }
        } else {
            // Name missing in one or more sources
            validationResults.correctListInAll = false;
            if (!snowEntry) {
                validationResults.extraNames.correctListNotIn.snow.push(name);
            }
            if (!salesforceEntry) {
                validationResults.extraNames.correctListNotIn.salesforce.push(name);
            }
            if (!myPortalEntry) {
                validationResults.extraNames.correctListNotIn.myPortal.push(name);
            }
        }
    });

    // Check for names in SNOW, Salesforce, or MyPortal but not in Correct List
    snowData.forEach(entry => {
        if (!correctListData.find(item => item.name === entry.name)) {
            validationResults.extraNames.snow.push(entry.name);
        }
    });
    salesforceData.forEach(entry => {
        if (!correctListData.find(item => item.name === entry.name)) {
            validationResults.extraNames.salesforce.push(entry.name);
        }
    });
    myPortalData.forEach(entry => {
        if (!correctListData.find(item => item.name === entry.name)) {
            validationResults.extraNames.myPortal.push(entry.name);
        }
    });

    return validationResults;
}

function displayValidationResults(validationResults) {
    const resultsDiv = document.getElementById('validationResults');
    resultsDiv.innerHTML = '';

    if (validationResults.userInAllSystems.length > 0) {
        resultsDiv.innerHTML += '<p><strong>USER/S IN ALL SYSTEMS:</strong></p>';
        validationResults.userInAllSystems.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.correctListInAll) {
        resultsDiv.innerHTML += '<p><strong>All names in the Correct List are present in SNOW, Salesforce, and MyPortal.</strong></p>';
    }

    if (Object.keys(validationResults.incorrectData).length > 0) {
        resultsDiv.innerHTML += '<p><strong>Incorrect Data:</strong></p>';
        Object.keys(validationResults.incorrectData).forEach(name => {
            resultsDiv.innerHTML += `<p>${name}: ${validationResults.incorrectData[name]}</p>`;
        });
    }

    if (validationResults.extraNames.snow.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN SNOW BUT NOT IN CLIENT LIST:</strong></p>';
        validationResults.extraNames.snow.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.extraNames.salesforce.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN SALESFORCE BUT NOT IN CLIENT LIST:</strong></p>';
        validationResults.extraNames.salesforce.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.extraNames.myPortal.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN MYPORTAL BUT NOT IN CLIENT LIST:</strong></p>';
        validationResults.extraNames.myPortal.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.extraNames.correctListNotIn.snow.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN CLIENT LIST BUT NOT IN SNOW:</strong></p>';
        validationResults.extraNames.correctListNotIn.snow.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.extraNames.correctListNotIn.salesforce.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN CLIENT LIST BUT NOT IN SALESFORCE:</strong></p>';
        validationResults.extraNames.correctListNotIn.salesforce.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }

    if (validationResults.extraNames.correctListNotIn.myPortal.length > 0) {
        resultsDiv.innerHTML += '<p><strong>IN CLIENT LIST BUT NOT IN MYPORTAL:</strong></p>';
        validationResults.extraNames.correctListNotIn.myPortal.forEach(name => {
            resultsDiv.innerHTML += `<p>${name}</p>`;
        });
    }
}

function validateEmail(email) {
    if (email === '') {
        return 'Email is missing';
    }
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email is incorrect';
    }
    return true;
}

function validatePhoneNumber(phoneNumber, type) {
    if (phoneNumber === '') {
        return `${type} is missing`;
    }
    // Regular expression to validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return `${type} is incorrect`;
    }
    return true;
}
