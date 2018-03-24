// Require Node.JS core package(s)
const {
    readFile
} = require('fs');
const { promisify } = require('util');
const { extname } = require('path');

// Require third-party lib
const set = require('lodash.set');

// Promisified FileSystem Interface
const AsyncFS = {
    readFile: promisify(readFile)
};

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
 * @class PDSReader
 * @classdesc Read PDS Configuration File
 * 
 * @property {String} filename
 */
class PDSReader {

    /**
	 * @constructor
	 * @param {!String} filename PDS (CFG) fileName
	 * 
	 * @throws {Error}
	 */
    constructor(filename) {
        const fileExt = extname(filename);
        if (fileExt !== '.cfg') {
            throw new Error('filename argument extension should be a .cfg');
        }
        this.filename = filename;
        this._content = {};
    }

    /**
	 * @public
	 * @async
	 * @method read
	 * @memberof PDSReader#
	 * @desc Read and parse the File
	 * @returns {Promise<Object>} Return Object!
	 * @throws {Error}
	 */
    async read() {
        const parsedObject = PDSReader.parsePDSBuffer(
            await AsyncFS.readFile(this.filename)
        );
        Object.assign(this._content, parsedObject);

        return this._content;
    }

    /**
	 * @static
	 * @method parsePDSBuffer
	 * @param {!Buffer} buf Buffer to be parsed into a readable JavaScript Object
	 * @returns {Object} Return parsed JavaScript Object
	 */
    static parsePDSBuffer(buf) {
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

module.exports = PDSReader;
