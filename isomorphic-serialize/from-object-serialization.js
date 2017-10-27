
var Types = require("./types");

// Returns a deserialized object.
// Expects a serialized object and an options object.
// options:
// `immutable`: BOOL — Forces the deserialized object to be immutable.
module.exports = function(anObjectSerialization, options)
{
    var deserializedObjects = [];
    var context = {
        options: options || {},
        anObjectSerialization: anObjectSerialization,
        deserializedObjects: deserializedObjects,
        typeMap: anObjectSerialization.typeMap || { "0": 0, "1": 1 }
    };

    return fromObjectSerialization(anObjectSerialization.index, context);
};

function fromObjectSerialization(index, context)
{
    if (index === -1)
        return null;
    if (index === -2)
        return undefined;
    if (index === -3)
        return NaN;
    if (index === -4)
        return -0;
    if (index === -5)
        return -Infinity;
    if (index === -6)
        return Infinity;

    // Check to see if the object has already been deserialized.
    if (context.deserializedObjects.hasOwnProperty(index))
        return context.deserializedObjects[index];

    var serializedObject = context.anObjectSerialization.objects[index];

    if (typeof serializedObject !== "object")
    {
        // Numbers, Strings, and Booleans don't need any extra work.
        context.deserializedObjects[index] = serializedObject;
        return serializedObject;
    }

    var preperationWrapper = Types.prepareForDeserialization(serializedObject, context, fromObjectSerialization);
    var base = preperationWrapper[0];
    var deserializer = preperationWrapper[1];
    // Everything that remains is a collection.
    context.deserializedObjects[index] = base;
    return deserializer(base);
}
