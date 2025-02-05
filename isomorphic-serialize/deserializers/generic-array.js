
var invoker = require("../utils").invoker;
var deserializeKeyValuePairs = require("./generic-key-value-pairs");

module.exports = deserializeGenericArray;

var GaplessMode  = 1;
var GapMode      = 2;
var KeyValueMode = 3;

function deserializeGenericArray(aDeserializedArray, serializedArray, context, fromObjectSerialization)
{
    var forceImmutable = context.options.immutable;
    var set = forceImmutable ? invoker("set") : setValueForKey;

    var mode = GaplessMode;

    var currentReadIndex = 1;
    var currentInsertionIndex = 0;
    var length = serializedArray.length;

    var gapStart = -1;
    var gapLength = -1;
    var currentGapIndexCount = 0;

    for (; currentReadIndex < length;)
    {
        var value = serializedArray[currentReadIndex++];

        var isTerminal = Array.isArray(value);

        if (isTerminal)
        {
            // Transitioning to key/value.
            if (mode === GapMode && gapStart + gapLength !== aDeserializedArray.length)
                fillInRemainingEmptySpaces(aDeserializedArray, gapStart + gapLength);

            mode++;
            continue;
        }

        if (mode === GaplessMode)
            set(currentInsertionIndex++, fromObjectSerialization(value, context), aDeserializedArray);
        else if (mode === GapMode)
        {
            if (currentGapIndexCount >= gapLength)
            {
                gapStart = value;
                gapLength = serializedArray[currentReadIndex++];
                currentGapIndexCount = 0;
            }
            else
            {
                set(gapStart + currentGapIndexCount, fromObjectSerialization(value, context), aDeserializedArray);
                currentGapIndexCount++;
            }
        }
        else if (mode === KeyValueMode)
            break;
    }

    deserializeKeyValuePairs(serializedArray, aDeserializedArray, currentReadIndex - 1, length - 1, context, false, fromObjectSerialization);


    if (mode === GapMode && gapStart + gapLength > aDeserializedArray.length)
        fillInRemainingEmptySpaces(aDeserializedArray, gapStart + gapLength);

    return aDeserializedArray;
}

function fillInRemainingEmptySpaces(aDeserializedArray, lastIndex)
{
    if (lastIndex > 0)
        aDeserializedArray.length = lastIndex;
}

function setValueForKey(aKey, anItem, anObject)
{
    anObject[aKey] = anItem;
}
