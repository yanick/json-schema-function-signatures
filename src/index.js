import Ajv from 'ajv';
import { array } from 'json-schema-shorthand';
import _ from 'lodash';

import { 
    JsonSchemaSignatureError, 
    JsonSchemaContextSignatureError,
    JsonSchemaOutputSignatureError,
    JsonSchemaInputSignatureError
} from './errors';


export default
class FunctionSignatures {

    constructor(options={}) {
        this.ajv = options.ajv || new Ajv();
        this._onError = options.onError 
            || ( error =>  throw error );
        this._disabled = Object.hasOwnProperty(options,'disabled') ? options.disabled : false;
        this._disabled = _.get(options,'disabled',false);
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(bool) { return this._disabled = bool }

    inSchema(schema) {
        if( _.isArray(schema) ) schema = array(schema);
        let validator = this.ajv.compile(schema);
        let sign = this;
        return fn => function(...args) {

        if(!sign.disabled && !validator(args)) {
            sign.onError( new JsonSchemaInputSignatureError(
                validator.errors, args
            ));
        }
        return this::fn(...args);
        };
    }

    outSchema(schema) {
        let validator = this.ajv.compile(schema);
        let sign = this;

        return fn => function() {
            let result = this::fn(...arguments);

            if(!sign.disabled && !validator(result)) {
                sign.onError( new JsonSchemaOutputSignatureError(
                    validator.errors, result
                ));
            }

            return result;
        };
    }

    get onError() {
        return this._onError;
    }

    contextSchema(schema) {
        const validator = this.ajv.compile(schema);
        let sign = this;

        return fn => function() {
            if(!sign.disabled && !validator(this)) {
                let error = new JsonSchemaContextSignatureError(
                    validator.errors, this
                );
                sign.onError(error);
            }
            return this::fn(...arguments);
        };
    }

    funcSchema(input=undefined,out=undefined,context=undefined) {
        let funcs = [];
        if( input !== undefined ) funcs.push( this.inSchema(input) );
        if( out !== undefined ) funcs.push( this.outSchema(out) );
        if( context !== undefined ) funcs.push( this.contextSchema(context) );

        return fn => [ ...funcs, fn ].reduceRight( (accum,f) => f(accum) );
    }

}

const default_object = new FunctionSignatures();

export const inSchema      = default_object::default_object.inSchema;
export const outSchema     = default_object::default_object.outSchema;
export const contextSchema = default_object::default_object.contextSchema;
export const funcSchema = default_object::default_object.funcSchema;


