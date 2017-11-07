const test = require("ava");
const I = require("immutable");
const { parse, stringify } = require("../");

const convert = aValue => parse(stringify(aValue));
const fastConvert = aValue => parse(stringify(aValue, { fastMode: true }));
const run = (aValue, t) =>
{
    t.deepEqual(convert(aValue), aValue);
    t.deepEqual(fastConvert(aValue), aValue);
};

test("empty", t => run({}, t));

test("simple", t => run({foo: 123}, t));
test("simple 2", t => run({foo: "abc"}, t));

test("Nested", t => run({foo: { bar: "bar"}}, t));
test("Deep nests", t => run({foo: { bar: {bar: {a: {b: true}, b: false, c: "abc"}, "abc": 123}}}, t));

test("Nested immutable", t =>
{
    const input = {
        foo: {
            bar: {
                baz: 123
            }
        }
    };
    const expectedResult = I.Map({foo: I.Map({bar: I.Map({baz: 123})})});

    const immutableCopy = parse(stringify(input), { immutable: true});
    t.true(immutableCopy.equals(convert(expectedResult)));
});


test("Circular", t =>
{
    var foo = {};
    var bar = { foo: foo, test: 1 };
    foo.bar = bar;

    var converted = convert(foo);
    t.is(converted, converted.bar.foo);
    t.is(converted.bar, converted.bar.foo.bar);
    t.is(converted.bar.test, 1);
});
