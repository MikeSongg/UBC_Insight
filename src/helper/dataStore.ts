import * as jszip from "jszip";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../controller/IInsightFacade";

// TODO: The persistent module here

export class DataStore {
	constructor() {
		console.log("dataStore::init()");
	}

	public testStore(id: string, content: string, kind: InsightDatasetKind) {
		return "Yes";
	}
}
