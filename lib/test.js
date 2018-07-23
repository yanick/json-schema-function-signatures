"use strict";

var _ref, _ref2, _ref3;

var _jsonSchemaShorthand = require("json-schema-shorthand");

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const myFunc = (_ref = (_ref2 = (_ref3 = function (foo, bar) {
  return {
    sum: foo + bar,
    ctx: {
      baz: this
    }
  };
}, (0, _index.inSchema)([(0, _jsonSchemaShorthand.number)({
  minimum: 2
}), (0, _jsonSchemaShorthand.number)({
  maximum: 3
})])(_ref3)), (0, _index.outSchema)((0, _jsonSchemaShorthand.object)({
  sum: (0, _jsonSchemaShorthand.number)({
    minimum: 10
  }),
  ctx: (0, _jsonSchemaShorthand.object)({
    baz: (0, _jsonSchemaShorthand.string)({
      minLength: 3
    })
  })
}))(_ref2)), (0, _index.contextSchema)((0, _jsonSchemaShorthand.string)())(_ref));
test("happy path", () => {
  var _context;

  expect((_context = "foobar", myFunc).call(_context, 13, 2)).toMatchObject({
    sum: 15,
    ctx: {
      baz: "foobar"
    }
  });
});
test("failing validation", () => {
  expect(() => myFunc(13, 2)).toThrowErrorMatchingInlineSnapshot(`
"context validation error. value: undefined, errors: [
  {
    \\"keyword\\": \\"type\\",
    \\"dataPath\\": \\"\\",
    \\"schemaPath\\": \\"#/type\\",
    \\"params\\": {
      \\"type\\": \\"string\\"
    },
    \\"message\\": \\"should be string\\"
  }
]"
`);
  expect(() => {
    var _context2;

    return (_context2 = "potato", myFunc).call(_context2, 13, 4);
  }).toThrowErrorMatchingInlineSnapshot(`
"input validation error. value: [
  13,
  4
], errors: [
  {
    \\"keyword\\": \\"maximum\\",
    \\"dataPath\\": \\"[1]\\",
    \\"schemaPath\\": \\"#/items/1/maximum\\",
    \\"params\\": {
      \\"comparison\\": \\"<=\\",
      \\"limit\\": 3,
      \\"exclusive\\": false
    },
    \\"message\\": \\"should be <= 3\\"
  }
]"
`);
  expect(() => {
    var _context3;

    return (_context3 = "potato", myFunc).call(_context3, 2, 2);
  }).toThrowErrorMatchingInlineSnapshot(`
"output validation error. value: {
  \\"sum\\": 4,
  \\"ctx\\": {
    \\"baz\\": \\"potato\\"
  }
}, errors: [
  {
    \\"keyword\\": \\"minimum\\",
    \\"dataPath\\": \\".sum\\",
    \\"schemaPath\\": \\"#/properties/sum/minimum\\",
    \\"params\\": {
      \\"comparison\\": \\">=\\",
      \\"limit\\": 10,
      \\"exclusive\\": false
    },
    \\"message\\": \\"should be >= 10\\"
  }
]"
`);
});
test("disable", () => {
  var _ref4, _ref5, _ref6;

  const sign = new _index2.default({
    disabled: true
  });
  const myFunc = (_ref4 = (_ref5 = (_ref6 = function (foo, bar) {
    return {
      sum: foo + bar,
      ctx: {
        baz: this
      }
    };
  }, sign.inSchema([(0, _jsonSchemaShorthand.number)({
    minimum: 2
  }), (0, _jsonSchemaShorthand.number)({
    maximum: 3
  })])(_ref6)), sign.outSchema((0, _jsonSchemaShorthand.object)({
    sum: (0, _jsonSchemaShorthand.number)({
      minimum: 10
    }),
    ctx: (0, _jsonSchemaShorthand.object)({
      baz: (0, _jsonSchemaShorthand.string)({
        minLength: 3
      })
    })
  }))(_ref5)), sign.contextSchema((0, _jsonSchemaShorthand.string)())(_ref4));
  expect(() => myFunc(1, 100)).not.toThrow();
  sign.disabled = false;
  expect(() => myFunc(1, 100)).toThrow();
});
describe("funcSchema", () => {
  var _ref7;

  const myFunc = (_ref7 = function (foo, bar) {
    return {
      sum: foo + bar,
      ctx: {
        baz: this
      }
    };
  }, (0, _index.funcSchema)([(0, _jsonSchemaShorthand.number)({
    minimum: 2
  }), (0, _jsonSchemaShorthand.number)({
    maximum: 3
  })], (0, _jsonSchemaShorthand.object)({
    sum: (0, _jsonSchemaShorthand.number)({
      minimum: 10
    }),
    ctx: (0, _jsonSchemaShorthand.object)({
      baz: (0, _jsonSchemaShorthand.string)({
        minLength: 3
      })
    })
  }), (0, _jsonSchemaShorthand.string)())(_ref7));
  test("happy path", () => {
    var _context4;

    expect((_context4 = "foobar", myFunc).call(_context4, 13, 2)).toMatchObject({
      sum: 15,
      ctx: {
        baz: "foobar"
      }
    });
  });
  test("failing validation", () => {
    expect(() => myFunc(13, 2)).toThrowErrorMatchingInlineSnapshot(`
"context validation error. value: undefined, errors: [
  {
    \\"keyword\\": \\"type\\",
    \\"dataPath\\": \\"\\",
    \\"schemaPath\\": \\"#/type\\",
    \\"params\\": {
      \\"type\\": \\"string\\"
    },
    \\"message\\": \\"should be string\\"
  }
]"
`);
  });
});