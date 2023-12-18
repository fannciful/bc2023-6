const { Validator } = require('jsonschema');
function createValidator(body) {
    // Schema for creating a device
    const createDeviceSchema = {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "desc": { "type": "string" },
            "serial_number": { "type": "string" },
            "manufacturer": { "type": "string" },
            "image_path": { "type": "string" }
        },
        "required": ["serial_number"],
        "additionalProperties": false
    };
    const validator = new Validator();
    const validationResult = validator.validate(body, createDeviceSchema);
    return validationResult.errors.length === 0;
}

function updateValidator(body) {
    const validator = new Validator();

    // Schema for updating a device
    const updateDeviceSchema = {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "desc": { "type": "string" },
            "serial_number": { "type": "string" },
            "manufacturer": { "type": "string" },
            "image_path": { "type": "string" }
        },
        "additionalProperties": false
    };

    const validationResult = validator.validate(body, updateDeviceSchema);
    return validationResult.errors.length === 0;
}

function userValidator(body) {
    const validator = new Validator();

    // Schema for creating a user
    const createUserSchema = {
        "type": "object",
        "properties": {
            "username": { "type": "string" },
            "name": { "type": "string" },
            "surname": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" }
        },
        "required": ["username"],
        "additionalProperties": false
    };

    const validationResult = validator.validate(body, createUserSchema);
    return validationResult.errors.length === 0;
}

function userUpdateValidator(body) {
    const validator = new Validator();

    // Schema for updating a user
    const updateUserSchema = {
        "type": "object",
        "properties": {
            "username": { "type": "string" },
            "name": { "type": "string" },
            "surname": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" }
        },
        "additionalProperties": false
    };

    const validationResult = validator.validate(body, updateUserSchema);
    return validationResult.errors.length === 0;
}

module.exports = {
    createValidator,
    updateValidator,
    userValidator,
    userUpdateValidator
};
