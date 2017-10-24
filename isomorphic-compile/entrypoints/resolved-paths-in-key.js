
const Module = require("module");
const { dirname } = require("path");


module.exports = function resolvedPathsInKey(visited = new Set(), key, children)
{
    const extracted = new Set();
    const updated = new Set(visited);

    return [children.map(function (child)
    {
        if (!child)
            return child;

        const mapping = { };

        for (const entrypoint of child.entrypoints || [])
        {
            const resolved = requireResolve(entrypoint, child.path);
            
            if (!visited.has(resolved))
            {
                extracted.add(resolved);
                updated.add(resolved);
            }
        }
        
        return { ...child, [key]: mapping };
    }), extracted, updated];
}

function requireResolve(path, from)
{
    const paths = Module._nodeModulePaths(dirname(from));
    const module = Object.assign(new Module(from),        
        { filename: from, paths });

    return Module._resolveFilename(path, module);
}
