
const { join, resolve } = require("path");
const hasOwnProperty = Object.prototype.hasOwnProperty;

const ok = value => ({ ok: value });
const error = Object.assign(
    message => ({ error: Error(message) }),
    { is: r => hasOwnProperty.call(r, "error") });

const r_require = toResult(require);
const r_get = (o, [key, ...rest], r_o = ok(o)) =>
    error.is(r_o) ? r_o :
    (o => o === undefined || o === null ?
        error(`object does not contain ${key}`) :
        rest.length ? ok(o) : r_get(0, ok(o), rest))(r_o.ok[key]);

module.exports = function compile(unresolved)
{
    const root = resolve(unresolved);
    const r_pjson = r_require(join(root, "package.json"));

    if (error.is(r_pjson))
        throw Errors.NotPackage(root);

    const r_node = r_get(r_pjson.ok, ["engines", "node"]);
    const node = r_node.error ? process.version : r_node.ok;

    if (error.is(r_node))
        console.warn(Messages.NoNode(root, node));

    const r_assets = r_get(r_pjson.ok, ["isomorphic", "assets"]);
    const assets = error.is(r_assets) ? [] : r_assets.ok;
    
    const babelOptions = {
        presets: [
            ["isomorphic-preset", { node }]
        ]
    }
    
    console.log(assets);
}

Errors =
{
    NotPackage: root => Error(`${root} has no package.json. ` +
        `\`isomorphic/compile\` must be run a project with a package.json.`)
}

Messages =
{
    NoNode: (root, using) => `No node version specified in the \`engines\` ` +
        `field of the package.json of \`${root}\`. \`isomorphic/compile\` ` +
        `uses this standard field to autoamtically apply the right babel ` +
        `transformations. The currently running ${using} will be used, but ` +
        `this should be treated as an error or you will not have reproducible ` +
        `builds. Find out more here: https://docs.npmjs.com/files/package.json#engines`
}

function toResult(f)
{
    return function ()
    {
        try
        {
            return ok(f.apply(this, arguments));
        }
        catch (error)
        {
            return { error };
        }
    }
}
