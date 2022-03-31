import * as fs from "fs-extra";

export class DataStore {

	private persistenceDir: string;

	constructor(pDir?: string) {
		console.log("dataStore::init()");
		if(pDir !== undefined) {
			this.persistenceDir = pDir;
		} else {
			this.persistenceDir = "./data/";
		}
	}

	public testStore(datasetToStore: object, fileName: string){
		console.log("File added:" + fileName);
		let dataString = JSON.stringify(datasetToStore, (key, value) => {
			if (value instanceof Map) {
				return {
					dataType: "Map",
					value: Array.from(value.entries()),
				};
			} else {
				return value;
			}
		});

		fs.writeFileSync(this.persistenceDir + fileName + ".json", dataString);
	}

	public testRead(): object[] {
		let fileContentList: object[] = [];

		if(fs.existsSync(this.persistenceDir)) {
			let fileNameList = fs.readdirSync(this.persistenceDir);
			fileNameList.forEach((file) => {
				fileContentList.push(JSON.parse(
					fs.readFileSync(this.persistenceDir + file, {encoding: "utf-8"}), (key, value) => {
						if(typeof value === "object" && value !== null) {
							if (value.dataType === "Map") {
								return new Map(value.value);
							}
						}
						return value;
					}));
			});
		}

		return fileContentList;
	}
}
