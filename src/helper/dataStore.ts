import * as fs from "fs-extra";

// TODO: The persistent module here

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

	public testStore(datasetToStore: unknown, fileName: string){
		let dataString = JSON.stringify(datasetToStore);
		if(!fs.pathExistsSync(this.persistenceDir)) {
			fs.mkdirSync(this.persistenceDir);
		}
		fs.writeFileSync(this.persistenceDir + fileName + ".json", dataString);
	}

	public testRead(): object[] {
		let fileContentList: object[] = [];

		if(fs.existsSync(this.persistenceDir)) {
			let fileNameList = fs.readdirSync(this.persistenceDir);
			fileNameList.forEach((file) => {
				fileContentList.push(JSON.parse(
					fs.readFileSync(this.persistenceDir + file, {encoding: "utf-8"})));
			});
		}

		return fileContentList;
	}
}
