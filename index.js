// Require Node.JS core package(s)
const { readFile } = require('fs').promises;

// Require third-party lib
const set = require('lodash.set');

// CONSTANTS
const CHAR = {
    cO: '<'.charCodeAt(0),
    cE: '>'.charCodeAt(0),
    cC: '/'.charCodeAt(0),
    eQ: '='.charCodeAt(0),
    rC: '\n'.charCodeAt(0)
};
const PDSKeyValueRegExp = /^([a-zA-Z0-9_.]+)\s=\s(.*)/;

/**
 * @export
 * @class nimCfgReader
 * @classdesc Read Nimsoft (UIM) Configuration file
 * 
 * @property {String} filename
 */
class nimCfgReader {

    /**
	 * @constructor
	 * @param {!String} filename Configuration file path/name
	 * 
     * @throws {TypeError}
	 * @throws {Error}
	 */
    constructor(filename) {
        if(typeof filename !== "string") {
            throw new TypeError('filename must be a string');
        }

        this.filename = filename;
    }

    /**
	 * @public
	 * @async
	 * @method read
	 * @memberof PDSReader#
	 * @desc Read and parse the Configuration file
	 * @returns {Promise<object>} Return Object!
	 */
    async read() {
        const buf = await readFile(this.filename);

        return nimCfgReader.parseConfigurationBuffer(buf);
    }

    /**
	 * @static
	 * @method parseConfigurationBuffer
	 * @param {!Buffer} buf Buffer to be parsed into a readable JavaScript Object
	 * @returns {Object} Return parsed JavaScript Object
	 */
    static parseConfigurationBuffer(buf) {
        if(typeof buf === 'undefined') {
            throw new TypeError('buf argument cannot be undefined!');
        }
        if(typeof buf === 'string') {
            buf = Buffer.from(buf);
        }
        const ret = {};
        const currSections = [];
        let offsetSection = 0, rNOffset = 0, openSection = false, detectedKey = false, i = 0;
        for (; i < buf.length; ++i) {
            if (buf[i] === CHAR.cO && buf[i + 1] !== CHAR.cC) {
                offsetSection = i + 1;
                openSection = true;
            }
            else if (buf[i] === CHAR.cO && buf[i + 1] === CHAR.cC) {
                currSections.pop();
            }
            else if (buf[i] === CHAR.cE && openSection) {
                const sectionName = buf.slice(offsetSection, i).toString();
                currSections.push(sectionName);
                set(ret, currSections.join('.'), {});
                openSection = false;
            }
            else if (buf[i] === CHAR.eQ) {
                detectedKey = true;
            }
            else if (buf[i] === CHAR.rC) {
                if (detectedKey) {
                    detectedKey = false;
                    const [, key, value] = PDSKeyValueRegExp.exec(
                        buf.slice(rNOffset, i - 1).toString().trim()
                    );
                    set(ret, currSections.join('.').concat(`.${key}`), value);
                }
                rNOffset = i + 1;
            }
        }
        return ret;
    }

}

module.exports = nimCfgReader;
