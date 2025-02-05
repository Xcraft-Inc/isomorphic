const test = require("ava");
const { Set } = require("immutable");

const { parse, stringify } = require("../");

const convert = aValue => parse(stringify(aValue));
const fastConvert = aValue => parse(stringify(aValue, { fastMode: true }));

const run = (aValue, t) =>
{
    t.true(aValue.equals(convert(aValue)));
    t.true(aValue.equals(fastConvert(aValue)));
};

test("empty", t => run(Set(), t));

test("simple", t => run(Set([1,2,3]), t));
test("simple 2", t => run(Set(["foo", "bar"]), t));
test("Duplicates", t => run(Set(["abc", 123, 123, "abc"]), t));

test("Nested primitive", t =>
{
    const value = Set(["foo", ["bar", "baz"]]);
    const value2 = convert(value);
    t.is(value.size, value2.size);
    t.is(value.first(), value2.first());
    t.deepEqual(value.last(), value2.last());
});

test("Nested 2", t => run(Set(["foo", Set(["bar", "baz"])]), t));
