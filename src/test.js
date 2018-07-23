import { number, object, string } from "json-schema-shorthand";
import { inSchema, outSchema, contextSchema, funcSchema } from "./index";

import FunctionSignatures from "./index";

const myFunc =
  function(foo, bar) {
    return { sum: foo + bar, ctx: { baz: this } };
  }
  |> inSchema([number({ minimum: 2 }), number({ maximum: 3 })])
  |> outSchema(
    object({
      sum: number({ minimum: 10 }),
      ctx: object({ baz: string({ minLength: 3 }) })
    })
  )
  |> contextSchema(string());

test("happy path", () => {
  expect("foobar"::myFunc(13, 2)).toMatchObject({
    sum: 15,
    ctx: { baz: "foobar" }
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

  expect(() => "potato"::myFunc(13, 4)).toThrowErrorMatchingInlineSnapshot(`
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

  expect(() => "potato"::myFunc(2, 2)).toThrowErrorMatchingInlineSnapshot(`
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
  const sign = new FunctionSignatures({ disabled: true });

  const myFunc =
    function(foo, bar) {
      return { sum: foo + bar, ctx: { baz: this } };
    }
    |> sign.inSchema([number({ minimum: 2 }), number({ maximum: 3 })])
    |> sign.outSchema(
      object({
        sum: number({ minimum: 10 }),
        ctx: object({ baz: string({ minLength: 3 }) })
      })
    )
    |> sign.contextSchema(string());

  expect(() => myFunc(1, 100)).not.toThrow();

  sign.disabled = false;

  expect(() => myFunc(1, 100)).toThrow();
});

describe("funcSchema", () => {
  const myFunc =
    function(foo, bar) {
      return { sum: foo + bar, ctx: { baz: this } };
    }
    |> funcSchema(
      [number({ minimum: 2 }), number({ maximum: 3 })],
      object({
        sum: number({ minimum: 10 }),
        ctx: object({ baz: string({ minLength: 3 }) })
      }),
      string()
    );

  test("happy path", () => {
    expect("foobar"::myFunc(13, 2)).toMatchObject({
      sum: 15,
      ctx: { baz: "foobar" }
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
