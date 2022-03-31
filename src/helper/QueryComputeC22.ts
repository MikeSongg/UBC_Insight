import {TestDataset} from "./dataset";
import {InsightDatasetKind, InsightError, InsightResult} from "../controller/IInsightFacade";
import {endWith, Equal, includes, startWith} from "./asteriskc2";
import {computeAvg, computeCount, computeMax, computeMin, computeSum} from "./applyToken";
import {checkResult, convertResult, multipleGroupByArray} from "./QueryComputeHelper";

export class QueryComputeC22 {

	private insightDatasets: TestDataset[];
	private filteredResult: InsightResult[] = [];
	private trans: boolean;
	private groups: any[][] = [];
	private groupNames: any[] = [];
	private courseField: string[] = ["avg", "pass" , "fail" , "audit" , "year","dept", "id" , "instructor" , "title" ,
		"uuid"];

	private roomField: string[] = ["lat", "lon" , "seats","fullname", "shortname" , "number" , "name" , "address","type"
		, "furniture","href"];

	private Id: any;


	constructor(datasets: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = datasets;
		this.trans = false;
	}

	public queryComputeC22( query: any ): InsightResult[] | InsightError  {
		if (Object.keys(query).length === 3) {
			this.trans = true;
			this.Id = query["TRANSFORMATIONS"]["GROUP"][0].split("_")[0];
		}
		if (Object.keys(query).length === 2) {
			this.trans = false;
			this.Id = query["OPTIONS"]["COLUMNS"][0].split("_")[0];
		}
		let opt = query["OPTIONS"];
		let where = query["WHERE"];
		let queryDataset = this.insightDatasets.find((e) => e.id === this.Id);
		if (queryDataset === undefined) {
			return new InsightError("not defined");
		}
		if (queryDataset.kind === InsightDatasetKind.Courses) {
			let sectionsOrig = queryDataset.coursesObj;
			if (sectionsOrig === undefined ) {
				return new InsightError("section orig is not defined");
			}
			if (Object.keys(where).length === 0) {
				this.filteredResult = convertResult(this.courseField, sectionsOrig,this.Id);
			} else {
				this.filteredResult = convertResult(this.courseField, this.computeWHEREFilter(where,sectionsOrig),this.
					Id);
			}
		}
		if (queryDataset.kind === InsightDatasetKind.Rooms) {
			let roomsOrig = queryDataset.classRoomObj;
			if (roomsOrig === undefined ) {
				return new InsightError("room orig is not defined");
			}
			if (Object.keys(where).length === 0) {
				this.filteredResult = convertResult(this.roomField, roomsOrig,this.Id);
			} else {
				this.filteredResult = convertResult(this.roomField, this.computeWHEREFilter(where,roomsOrig),this.Id);
			}
		}
		if (this.trans) {
			let trans = query["TRANSFORMATIONS"];
			let transformedData =  this.computeTrans(trans, this.filteredResult);
			let result2 = this.computeOPT(opt,transformedData);
			return checkResult(result2);
		} else if(!this.trans) {
			let result2 = this.computeOPT(opt,this.filteredResult);
			return checkResult(result2);
		} else {
			return new InsightError("not defined");
		}
	}

	private computeTrans(trans: any, filteredData: InsightResult[]): InsightResult[] {
		let group = trans["GROUP"];
		let apply = trans["APPLY"];
		this.groupNames = group;
	//	https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
		this.groups = multipleGroupByArray(filteredData,function (property: any) {
			let arr: any[] = [];
			for (let key of group) {
				arr.push(property[key]);
			}
			return arr;
		});
		return this.computeApply(apply);
	}

	private computeApply(apply: any[]): InsightResult[] {
		let results: InsightResult[] = [];

		for (let group of this.groups) {
			let result: InsightResult = {};
			for (let key of this.groupNames) {
				result[key] = group[0][key];
			}
			for (let rule of apply) {
				let applykey = Object.keys(rule)[0]; // "maxSeats"
				let applyValue = rule[applykey]; // {"MAX": "room_seats"}
				let applyToken = Object.keys(applyValue)[0]; // max
				let key = Object.values(applyValue)[0]; // rooms_seats
				let value = this.computeApplyToken(applyToken,key,group);
				if (value !== undefined) {
					result[applykey] = value;
				}

			}
			results.push(result);
		}
		return results;
	}

	private computeApplyToken(applyToken: string, key: any, group: any[]) {
		let valueArray =  group.map((a) => a[key]);
		if (applyToken === "MAX") {
			return computeMax(valueArray);
		}
		if (applyToken === "MIN") {
			return computeMin(valueArray);
		}
		if (applyToken === "AVG") {
			return computeAvg(valueArray);
		}
		if (applyToken === "COUNT") {
			return computeCount(valueArray);
		}
		if (applyToken === "SUM") {
			return computeSum(valueArray);
		}

	}


	private computeWHEREFilter(where: any, filteredData: any[]): any{
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
			let result = this.computeIs(where[filter], filteredData);
			if (result !== null && result !== undefined) {
				return result;
			}
		} else {
			return this.computeNOT(where[filter], filteredData);
		}
	}


	private computeNOT(obj: any, filteredSections: any[]) {
		let filteredArr: any[] = this.computeWHEREFilter(obj,filteredSections);
		filteredArr = filteredSections.filter((x) => {
			return !filteredArr.includes(x);
		});
		return filteredArr;
	}

	private  computeIs(obj: any, filteredSections: any[]) {
		let key = Object.keys(obj)[0];// course_uuid
		let value = Object.values(obj)[0]; // "1234"
		if (typeof value !== "string") {
			throw  new InsightError("not valid");
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

	private computeOR(obj: any,filteredSections: any[]) {
		let arr: any[] = [];
		for (let o of obj) {
			arr = arr.concat(this.computeWHEREFilter(o,filteredSections));
		}
		return [...new Set(arr)];
	}

	private computeAND(obj: any,sections: any[]) {
		let data: any[] = sections;
		for (let o of obj) {
			data = this.computeWHEREFilter(o,data);
		}
		return data;
	}

	private  computeEQ(obj: any, filteredSections: any[]) {
		let key = Object.keys(obj)[0];// course_avg
		let value = Object.values(obj)[0]; // 97
		let arr = [];
		let mkey = key.split("_")[1]; // "avg"
		for (let sec of filteredSections) {
			if (sec[mkey] === value) {
				arr.push(sec);
			}
		}
		return arr;
	}

// considering add a new parameter for original data
	private  computeLT(obj: any, filteredSections: any[]) {
		let key = Object.keys(obj)[0];// course_avg
		let value = obj[key]; // 97
		let mkey = key.split("_")[1]; // "avg"
		let arr = [];
		for (let sec of filteredSections) {
			if (sec[mkey] < value) {
				arr.push(sec);
			}
		}
		return arr;
	}

	private  computeGT(obj: any, filteredSections: any[]) {
		let key = Object.keys(obj)[0];// course_avg
		let value = obj[key]; // 97
		let arr = [];
		let mkey = key.split("_")[1]; // "avg"
		for (let sec of filteredSections) {
			if (sec[mkey] > value) {
				arr.push(sec);
			}
		}
		return arr;
	}

	private  computeOPT(opt: any, converted: InsightResult[]) {
		if (Object.keys(opt).length === 1) {
			return this.computeCOLUMNS(opt["COLUMNS"],converted);
		} else {
			let sortedSections = this.computeORDER(opt["ORDER"],converted);
			if (sortedSections !== undefined) {
				return this.computeCOLUMNS(opt["COLUMNS"],sortedSections);
			}
		}
	}

	private  computeCOLUMNS(col: string[], converted: InsightResult[]): InsightResult[]{
		let resultList: InsightResult[] = [];
		for(let cObj of converted) {
			let insightResult: InsightResult = {};
			for (let key of col) {
				insightResult[key] = cObj[key];
			}
			resultList.push(insightResult);
		}
		return resultList;
	}

	private  computeORDER(ord: any, sections: InsightResult[]) {
		if (typeof ord === "string") {
			return sections.sort((a, b) => (a[ord] < b[ord]) ? -1 : 1);
		} else if (typeof ord === "object"){
			let dir: string = ord["dir"];
			let keys: string[] = ord["keys"];
			let direction: number = 0;
			if (dir === "UP") {
				direction = 1;
			} else if (dir === "DOWN") {
				direction = -1;
			}
			// https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields
			const fieldSorter = (fields: string[]) => (a: InsightResult, b: InsightResult) => keys.map((o) => {
				return a[o] > b[o] ? direction : a[o] < b[o] ? -direction : 0;
			}).reduce((p, n) => p ? p : n, 0);
			return sections.sort(fieldSorter(keys));
		}
	}
}
