
var invoker = require("../utils").invoker;
var isImmutable = require("immutable").Map.isMap;

var immutableSet = invoker("set");

module.exports = deserializeGenericObject;

function deserializeGenericObject(aDeserializedObject, serializedObject, context, fromObjectSerialization)
{
    var forceImmutable = context.options.immutable;
    var set = (forceImmutable || isImmutable(aDeserializedObject)) ? immutableSet : setValueForKey;

    // index 0 is the type, all other values are deseriailzed and inserted into the
    // deserialized array in their current order.
    var keyIndex = 1;
    var count = serializedObject.length;

    for (; keyIndex < count; keyIndex += 2)
    {
        var key = fromObjectSerialization(serializedObject[keyIndex], context);
        var value = fromObjectSerialization(serializedObject[keyIndex + 1], context);

        set(key, value, aDeserializedObject);
    }

    return aDeserializedObject;
}

function setValueForKey(aKey, aValue, anObject)
{
    anObject[aKey] = aValue;
}
