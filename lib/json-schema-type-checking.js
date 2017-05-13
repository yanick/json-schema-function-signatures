const Ajv = require('ajv');
const StackTrace = require( 'stacktrace-js' );

export default  function ValidateSchema(options) {

    let validator = new Ajv({ '$data': true, useDefaults: true });

    if( options.schema ) {
        validator.addSchema( options.schema, 'http://localhost/validate-schema' );
    }

    if (! options.on_validator_error ) {
        let logger = require('tracer').colorConsole(
            { format: "<{{title}}> {{message}} (in {{file}}:{{line}})",
                preprocess :  function(data){
                }
                });
        options.logger = logger;
        options.on_validator_error = ( type, data ) => {
            logger.error( type + ' value failed validation', data ) 
        };

    }

    if ( !options.groom_stack ) {
        options.groom_stack = stack => stack.filter( s => ! /json-schema-type-checking|module\.js|node\.js/.test( s.fileName )
            ).map( x => x.toString() );
    }

    let args = function ( args_type ) { 

        let validate = validator.compile(
            typeof args_type == 'string' ? { '$ref': 'https://localhost/validate-schema/' + args_type } : { type: 'array', ...args_type }
        );

        return function x ( target,name, descriptor ) { 
            let func = descriptor.value;

            descriptor.value = function(...args) {
                    if (!validate(args) ) {
                StackTrace.get().then( stack => {
                        options.on_validator_error( 'args', { args: args, errors: validate.errors,
                            stack: options.groom_stack(stack) } );
                })
                    }

                return func(...args);
            };
        }
    };

    let returns = function (return_type) { 
        let validate = validator.compile(
            typeof return_type == 'string' ? { '$ref': 'http://localhost/validate-schema' + return_type } : return_type );

        return function x ( target, name, descriptor ) {
            let func = descriptor.value;
            descriptor.value = function() {
                let args = arguments;
                let return_value = func(...arguments);

                if (!validate(return_value) ) {
                    StackTrace.get().then( stack => {
                            options.on_validator_error( 'return', { value: return_value, errors: validate.errors,
                                stack: options.groom_stack(stack)  } );
                    })
                }

                return return_value;
            };
        }
    }

    return { args, returns }
}
