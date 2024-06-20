const fs = require("fs");
const Pathurizer = require("pathurizer");
const getJsonProxy = require("./getJsonProxy");

class JsonDataAccessor
{
	/**
	 *
	 * @param {string} pathLike
	 * @param {function(property:string, value:any):void} [setterCallback]
	 */
	constructor(pathLike, setterCallback)
	{
		const parsed = Pathurizer.parse(pathLike);
		this.name = parsed.toFileNameIgnoreExtension;
		if(parsed.extension !== "json") parsed.extension = "json";
		this.path = parsed.url;

		/** @type {Object.<string>} */
		this.data = null;

		/** @type {Promise<object>} */
		this.initialize = new Promise(resolve =>
		{
			fs.readFile(this.path, "utf-8", (error, data)=>
			{
				if(error)
				{
					fs.writeFile(this.path, "{}", "utf-8", (error)=>
					{
						initializeComplete(this, resolve, error, "{}", setterCallback);
					});
				}
				initializeComplete(this, resolve, null, data, setterCallback);
			});
		});
	}
}

/**
 *
 * @param {JsonDataAccessor} accessor
 * @param resolve
 * @param {Error} error
 * @param {string} data
 * @param {function(property:string, value:any):void} setterCallback
 */
const initializeComplete = (accessor, resolve, error, data, setterCallback)=>
{
	if(error) throw error;
	accessor.data = getJsonProxy(JsonParse(data), accessor.path, setterCallback);
	resolve(accessor.data);
}

/**
 *
 * @param {string} data
 * @return {Object.<dependencies>}
 */
const JsonParse = (data)=>
{
	if(!data) return {};
	else
	{
		try {
			return JSON.parse(data);
		} catch (error) {
			return {};
		}
	}
}

module.exports = JsonDataAccessor;