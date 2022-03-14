import {CourseObject, TestDataset} from "./dataset";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import {endWith, Equal, includes, startWith} from "./asterisk";

export class QueryCompute {

	private insightDatasets: TestDataset[];
	private filteredSections: CourseObject[] = [];
	constructor(datasets: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = datasets;
	}

	public queryCompute( query: any ): InsightResult[] {
		let opt = query["OPTIONS"];
		let col = opt["COLUMNS"];
		let where = query["WHERE"];
		let key = col[0];
		let queryDatasetId = key.split("_")[0];
		let queryDataset = this.insightDatasets.find((e) => e.id === queryDatasetId);
		if (queryDataset === undefined) {
			throw new InsightError("not defined");
		}
		let sectionsOrig = queryDataset.coursesObj;
		if (Object.keys(where).length === 0) {
			this.filteredSections = sectionsOrig;
		} else {
			this.filteredSections = this.computeWHEREFilter(where,sectionsOrig);
		}
		return this.computeOPT(opt,this.filteredSections);

	}

	private computeWHEREFilter(where: any, filteredData: any): CourseObject[]{
		let filter = Object.keys(where)[0];
		if (filter === "AND") {
			return this.computeAND(where[filter],filteredData);
		}
		if (filter === "OR") {
			return this.computeOR(where[filter],filteredData);
		}

		if (filter === "GT") {
			return this.computeGT(where[filter], filteredData);
		}
		if (filter === "LT") {
			return this.computeLT(where[filter], filteredData);
		}
		if (filter === "EQ") {
			return this.computeEQ(where[filter], filteredData);
		}
		if ((filter === "IS") ){
			return this.computeIs(where[filter], filteredData);
		} else {
			return this.computeNOT(where[filter], filteredData);
		}
	}


	private computeNOT(obj: any, filteredSections: CourseObject[]) {
		let filteredArr: CourseObject[] = this.computeWHEREFilter(obj,filteredSections);
		// let sections: any[] = this.data.get(this.datasetID);
		filteredArr = filteredSections.filter((x) => {
			return !filteredArr.includes(x);
		});
		return filteredArr;

	}

	private computeIs(obj: any, filteredSections: CourseObject[]) {
		let key = Object.keys(obj)[0];// course_uuid
		let value = Object.values(obj)[0]; // "1234"
		if (typeof value !== "string") {
			throw new InsightError("not valid");
		}
		let skey = key.split("_")[1]; // "uuid"
		if (value.split("*").length === 1) {
			return Equal(skey,filteredSections,value);
		} else if (value.split("*").length === 2 && value.split("*")[1] === "") {
			value = value.split("*")[0];
			return startWith(skey,filteredSections,value);
		} else if (value.split("*").length === 2 && value.split("*")[0] === "") {
			value = value.split("*")[1];
			return endWith(skey,filteredSections,value);
		} else  {
			value = value.split("*")[1];
			return includes(skey,filteredSections,value);
		}
	}


	private computeOR(obj: any,filteredSections: CourseObject[]) {
		let arr: CourseObject[] = [];
		for (let o of obj) {
			arr = arr.concat(this.computeWHEREFilter(o,filteredSections));
		}
		return [...new Set(arr)];
	}

	private computeAND(obj: any,sections: CourseObject[]) {
		// use for loop;
		let data: CourseObject[] = sections;
		for (let o of obj) {
			data = this.computeWHEREFilter(o,data);
		}
		return data;
		// we should also add dataset as paramenter
	}

	private computeEQ(obj: any, filteredSections: CourseObject[]) {
		let key = Object.keys(obj)[0];// course_avg
		let value = Object.values(obj)[0]; // 97
		let arr = [];
		let mkey = key.split("_")[1]; // "avg"
		for (let sec of filteredSections) {
			switch(mkey){
				case "avg": if (sec.avg === value) {
					arr.push(sec);
				}
					break;
				case "pass": if (sec.pass === value) {
					arr.push(sec);
				}
					break;
				case "fail": if (sec.fail === value) {
					arr.push(sec);
				}
					break;
				case "audit": if (sec.audit === value) {
					arr.push(sec);
				}
					break;
				case "year": if (sec.id === value) {
					arr.push(sec);
				}
					break;
			}
		}
		return arr;
	}

// considering add a new parameter for original data
	private computeLT(obj: any,filteredSections: CourseObject[]) {
		let key = Object.keys(obj)[0];// course_avg
		// let value = Object.values(obj)[0]; // 97
		let value = obj[key]; // 97
		let mkey = key.split("_")[1]; // "avg"
		let arr = [];
		for (let sec of filteredSections) {
			switch(mkey){
				case "avg": if (sec.avg < value) {
					arr.push(sec);
				}
					break;
				case "pass": if (sec.pass < value) {
					arr.push(sec);
				}
					break;
				case "fail": if (sec.fail < value) {
					arr.push(sec);
				}
					break;
				case "audit": if (sec.audit < value) {
					arr.push(sec);
				}
					break;
				case "year": if (sec.id < value) {
					arr.push(sec);
				}
					break;
			}
		}
		return arr;
	}

	private computeGT(obj: any,filteredSections: CourseObject[]) {
		let key = Object.keys(obj)[0];// course_avg
		let value = obj[key]; // 97
		let arr = [];
		let mkey = key.split("_")[1]; // "avg"
		for (let sec of filteredSections) {
			switch(mkey){
				case "avg": if (sec.avg > value) {
					arr.push(sec);
				}
					break;
				case "pass": if (sec.pass > value) {
					arr.push(sec);
				}
					break;
				case "fail": if (sec.fail > value) {
					arr.push(sec);
				}
					break;
				case "audit": if (sec.audit > value) {
					arr.push(sec);
				}
					break;
				case "year": if (sec.id > value) {
					arr.push(sec);
				}
					break;
			}
		}
		return arr;
	}

	private  computeOPT(opt: any,sections: CourseObject[]) {
		if (Object.keys(opt).length === 1) {
			return this.computeCOLUMNS(opt["COLUMNS"],sections);
		} else {
			this.computeORDER(opt["ORDER"],sections);
			return this.computeCOLUMNS(opt["COLUMNS"],sections);
		}

	}

	// col is an arrary of keys
	private computeCOLUMNS(col: any,sections: CourseObject[]): InsightResult[]{
		let keyList: string[] = [];
		let resultList: InsightResult[] = [];
		let dataSetId = col[0].split("_")[0];
		for (let key of col) {
			let skey = key.split("_")[1]; // "uuid"
			keyList.push(skey);
		}

		for(let cObj of sections) {
			let insightResult: InsightResult = {};
			for(let skey of keyList) {
				switch(skey) {
					case "uuid": insightResult[dataSetId + "_" + skey] = cObj.uuid;
						break;
					case "dept": insightResult[dataSetId + "_" + skey] = cObj.dept;
						break;
					case "id": insightResult[dataSetId + "_" + skey] = cObj.id;
						break;
					case "title": insightResult[dataSetId + "_" + skey] = cObj.title;
						break;
					case "instructor": insightResult[dataSetId + "_" + skey] = cObj.instructor;
						break;
					case "avg": insightResult[dataSetId + "_" + skey] = cObj.avg;
						break;
					case "pass": insightResult[dataSetId + "_" + skey] = cObj.pass;
						break;
					case "fail": insightResult[dataSetId + "_" + skey] = cObj.fail;
						break;
					case "audit": insightResult[dataSetId + "_" + skey] = cObj.audit;
						break;
					case "year": insightResult[dataSetId + "_" + skey] = cObj.year;
						break;
				}
			}
			resultList.push(insightResult);

		}
		return resultList;

	}

	private computeORDER(ord: any,sections: CourseObject[]) {
		let mkey = ord.split("_")[1]; // this should be "avg"
		switch(mkey){
			case "avg": sections.sort(function(a, b) {
				return a.avg - b.avg;
			});
				break;
			case "pass": sections.sort(function(a, b) {
				return a.pass - b.pass;
			});
				break;
			case "fail": sections.sort(function(a, b) {
				return a.fail - b.fail;
			});
				break;
			case "audit": sections.sort(function(a, b) {
				return a.audit - b.audit;
			});
				break;
			case "year": sections.sort(function(a, b) {
				return a.year - b.year;
			});
				break;
		}

	}
}
