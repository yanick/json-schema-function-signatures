"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.funcSchema = exports.contextSchema = exports.outSchema = exports.inSchema = exports.default = undefined;

var _ajv = require("ajv");

var _ajv2 = _interopRequireDefault(_ajv);

var _jsonSchemaShorthand = require("json-schema-shorthand");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FunctionSignatures = class FunctionSignatures {
  constructor(options = {}) {
    this.ajv = options.ajv || new _ajv2.default();

    this._onError = options.onError || (error => function (e) {
      throw e;
    }(error));

    this._disabled = Object.hasOwnProperty(options, 'disabled') ? options.disabled : false;
    this._disabled = _lodash2.default.get(options, 'disabled', false);
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(bool) {
    return this._disabled = bool;
  }

  inSchema(schema) {
    if (_lodash2.default.isArray(schema)) schema = (0, _jsonSchemaShorthand.array)(schema);
    let validator = this.ajv.compile(schema);
    let sign = this;
    return fn => function (...args) {
      if (!sign.disabled && !validator(args)) {
        sign.onError(new _errors.JsonSchemaInputSignatureError(validator.errors, args));
      }

      return fn.call(this, ...args);
    };
  }

  outSchema(schema) {
    let validator = this.ajv.compile(schema);
    let sign = this;
    return fn => function () {
      let result = fn.call(this, ...arguments);

      if (!sign.disabled && !validator(result)) {
        sign.onError(new _errors.JsonSchemaOutputSignatureError(validator.errors, result));
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
    return fn => function () {
      if (!sign.disabled && !validator(this)) {
        let error = new _errors.JsonSchemaContextSignatureError(validator.errors, this);
        sign.onError(error);
      }

      return fn.call(this, ...arguments);
    };
  }

  funcSchema(input = undefined, out = undefined, context = undefined) {
    let funcs = [];
    if (input !== undefined) funcs.push(this.inSchema(input));
    if (out !== undefined) funcs.push(this.outSchema(out));
    if (context !== undefined) funcs.push(this.contextSchema(context));
    return fn => [...funcs, fn].reduceRight((accum, f) => f(accum));
  }

};
exports.default = FunctionSignatures;
const default_object = new FunctionSignatures();
const inSchema = exports.inSchema = default_object.inSchema.bind(default_object);
const outSchema = exports.outSchema = default_object.outSchema.bind(default_object);
const contextSchema = exports.contextSchema = default_object.contextSchema.bind(default_object);
const funcSchema = exports.funcSchema = default_object.funcSchema.bind(default_object);