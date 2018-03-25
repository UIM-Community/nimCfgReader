/**
 * DataBase Definition
 */
declare class nimCfgReader {
    constructor(filename: string);

	// Properties
	public filename: string;
	private _content: object;

	// Methods
	read(): Promise<object>;
	static parseConfigurationBuffer(buf: Buffer | string): object;
}

declare namespace nimCfgReader {

}

export as namespace nimCfgReader;
export = nimCfgReader;
