export 
class JsonSchemaSignatureError extends Error {
    constructor(errors,value) {
        super();
        this.value = value;
        this.errors = errors;
        let message = `validation error. value: ${JSON.stringify(value,null,2)}, errors: ${ JSON.stringify(errors,null,2)}`
        this.message = message;
        // Error.captureStackTrace(this, FunctionSignatures);
    }
}

export
class JsonSchemaContextSignatureError extends JsonSchemaSignatureError {
    constructor( errors, value ) {
        super(errors,value);
        this.signatureType = 'context';
        this.message = this.signatureType + ' ' + this.message;
    }
}

export
class JsonSchemaInputSignatureError extends JsonSchemaSignatureError {
    constructor( errors, value ) {
        super(errors,value);
        this.signatureType = 'input';
        this.message = this.signatureType + ' ' + this.message;
    }
}

export
class JsonSchemaOutputSignatureError extends JsonSchemaSignatureError {
    constructor( errors, value ) {
        super(errors,value);
        this.signatureType = 'output';
        this.message = this.signatureType + ' ' + this.message;
    }
}
