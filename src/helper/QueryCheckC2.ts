import {TestDataset} from "./dataset";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import {QueryCheckWhere} from "./QueryCheckWhere";
import {checkApplyValue} from "./QueryCheckTransFormation";

export class QueryCheckC2 {
	private Id: any;
	private insightDatasets: TestDataset[];
	private trans: boolean;
	private columnList: any[];
	private courseNumberField: string[] = ["avg", "pass" , "fail" , "audit" , "year"];
	private roomNumberField: string[] = ["lat", "lon" , "seats"];
	private transList: any[];
	private courseField: string[] = ["avg", "pass" , "fail" , "audit" , "year","dept", "id" , "instructor" , "title" ,
		"uuid"];

	private roomField: string[] = ["lat", "lon" , "seats","fullname", "shortname" , "number" , "name" , "address","type"
		, "furniture","href"];

	private datasetKind: string;

	constructor(datasets: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = datasets;
		this.trans = false;
		this.columnList = [];
		this.datasetKind = "";
		this.transList = [];
	}

	public queryCheckC2(queryRequest: unknown) {
		let query = queryRequest as any;
		if (query === null || query === undefined) {
			return new InsightError("query is not valid: not exist");
		}
		if (typeof query !== "object") {
			return new InsightError("query is not object");
		}
		if ((Object.keys(query).length === 2) && (Object.keys(query)[0] === "WHERE")
			&& (Object.keys(query)[1] === "OPTIONS")) {
			return this.check1(query);
		} else if ((Object.keys(query).length === 3) && (Object.keys(query)[0] === "WHERE")
			&& (Object.keys(query)[1] === "OPTIONS") && (Object.keys(query)[2] === "TRANSFORMATIONS")) {
			return this.check2(query);
		} else {
			return new InsightError("query has more than 3 keys  or less than 2 keys");
		}
	}

	private check1(query: any) {
		this.trans = false;
		let where = query["WHERE"];// query.WHERE
		let opt = query["OPTIONS"];
		if (opt["COLUMNS"] === undefined || opt["COLUMNS"] === null) {
			return new InsightError("column is not valid");
		}
		if (typeof opt["COLUMNS"][0] !== "string") {
			return new InsightError("cannot extract valid id");
		}
		this.Id = opt["COLUMNS"][0].split("_")[0];
		this.confirmType();
		let whereCheck = new QueryCheckWhere(this.datasetKind,this.Id);
		let whereResult = whereCheck.checkQueryWhere(where);
		if (whereResult instanceof InsightError) {
			return whereResult;
		}
		if (whereResult) {
			return this.checkQueryOPTIONS(opt);
		}
	}

	private check2(query: any) {
		this.trans = true;
		let where = query["WHERE"];// query.WHERE
		let opt = query["OPTIONS"];
		let trans = query["TRANSFORMATIONS"];
		if (trans["GROUP"] === undefined || trans["GROUP"] === null) {
			return new InsightError("group is not valid");
		}
		if (typeof trans["GROUP"][0] !== "string") {
			return new InsightError("cannot extract valid id");
		}
		this.Id = trans["GROUP"][0].split("_")[0];
		this.confirmType();
		let whereCheck = new QueryCheckWhere(this.datasetKind,this.Id);
		let whereResult = whereCheck.checkQueryWhere(where);
		if (whereResult instanceof InsightError) {
			return whereResult;
		}
		if (whereResult) {
			if (this.checkQueryTransformation(trans)) {
				return this.checkQueryOPTIONS(opt);
			}
		}
	}

	private confirmType() {
		let queryDataset = this.insightDatasets.find((e) => e.id === this.Id);
		if (queryDataset === undefined) {
			return new InsightError("not defined");
		}
		if (queryDataset.kind === InsightDatasetKind.Courses) {
			this.datasetKind = "course";
		} else {
			this.datasetKind = "room";
		}
	}

	private  checkQueryOPTIONS(opt: any)  {
		if (typeof opt !== "object") {
			return new InsightError("opt is not an object");
		}
		if (Object.keys(opt).length < 1 || Object.keys(opt).length > 2) {
			return new InsightError("opt is not valid: only 1 or 2 keys valid");
		}
		if (Object.keys(opt).length === 1 &&  Object.keys(opt)[0] === "COLUMNS") {
			return this.checkColumn(opt["COLUMNS"]);
		}
		if (Object.keys(opt).length === 2 && Object.keys(opt)[0] === "COLUMNS" && Object.keys(opt)[1] === "ORDER") {
			if (this.checkColumn(opt["COLUMNS"])) {
				return this.checkOrder(opt["ORDER"]);
			}
		} else {
			return new InsightError("option is not valid");
		}
	}

	private  checkColumn(col: any) {
		if(!Array.isArray(col)) {
			return new InsightError("column should be an array");
		}
		if (!this.trans){
			for (let key of col) {
				let datasetId = key.split("_")[0];
				let field = key.split("_")[1];
				if (this.datasetKind === "course") {
					if (!(this.courseField.includes(field))) {
						return new InsightError("not valid field");
					}
				}
				if (this.datasetKind === "room") {
					if (!(this.roomField.includes(field))) {
						return new InsightError("not valid field");
					}
				}
				if (this.Id !== datasetId) {
					return new InsightError("id is not valid");
				}
			}
			this.columnList = col;
			return true;
		}
		if (this.trans) {
			let columnSet = new Set(col);
			let transSet = new Set(this.transList);
			let areSetsEqual = (a: any, b: any) => a.size === b.size && [...a].every((value) => b.has(value));
			if (areSetsEqual(columnSet,transSet)) {
				this.columnList = col;
				return true;
			} else {
				return new InsightError("column is not valid");
			}
		}
	}

	private  checkOrder(ord: any) {
		if (typeof ord === "string")  {
			if (this.datasetKind === "course") {
				return (this.columnList.includes(ord));
			}
			if (this.datasetKind === "room") {
				return ( this.columnList.includes(ord));
			}
		}
		if ( typeof ord === "object") {
			if (!(Object.keys(ord)[0] === "dir" && Object.keys(ord)[1] === "keys")) {
				return new InsightError("order has undefined keys");
			}
			if (!(ord["dir"] === "UP" || ord["dir"] === "DOWN")) {
				return new InsightError("dir is not valid");
			}
			if (!Array.isArray(ord["keys"])) {
				return new InsightError("keys is not an array");
			}
			if (ord["keys"].length < 1) {
				return new InsightError("at least 1 key");
			}
			for (let key of ord["keys"]) {
				if (this.datasetKind === "course") {
					if (!( this.columnList.includes(key))) {
						return new InsightError("not valid order course field");
					}
				}
				if (this.datasetKind === "room") {
					if (!( this.columnList.includes(key))) {
						return new InsightError("not valid order room field");
					}
				}
			}
			return true;
		} else {
			return new InsightError("order is not valid");
		}
	}

	private checkQueryTransformation(trans: any) {
		if (typeof trans !== "object") {
			return new InsightError("transformation should be an object");
		}
		if (!(Object.keys(trans).length === 2 && Object.keys(trans)[0] === "GROUP" && Object.keys(trans)[1] === "APPLY"
		)) {
			return new InsightError("transformation doesn't include group and apply");
		} else {
			let group = trans["GROUP"];
			let apply = trans["APPLY"];
			return (this.checkGroup(group) && this.checkApply(apply));
		}
	}

	private checkGroup(group: any) {
		if (!(Array.isArray(group))) {
			return new InsightError("group should be an array");
		} else {
			for (let key of group) {
				let datasetId = key.split("_")[0];
				let field = key.split("_")[1];
				if (this.datasetKind === "course") {
					if (!(this.courseField.includes(field) && this.Id === datasetId)) {
						return new InsightError("not valid course group");
					}
				}
				if (this.datasetKind === "room") {
					if (!(this.roomField.includes(field) && this.Id === datasetId)) {
						return new InsightError("not valid course group");
					}
				}
			}
			this.transList = this.transList.concat(group);
			return true;
		}
	}

	private checkApply(apply: any) {
		if (!(Array.isArray(apply))) {
			return new InsightError("apply should be an array");
		} else {
			for (let applyRule of apply) {
				if (!this.checkApplyRule(applyRule)) {
					return new InsightError("apply rule not valid");
				}
			}
			return true;
		}
	}

	private checkApplyRule(rule: any) {
		if (typeof rule !== "object") {
			return new InsightError("rule should be an object");
		}
		if (Object.keys(rule).length !== 1) {
			return new InsightError("rule should only have 1 key");
		}
		let applyKey = Object.keys(rule)[0];
		let value = Object.values(rule)[0];
		return (checkApplyValue(value,this.Id,this.datasetKind,this.courseField,this.roomField,this.courseNumberField,
			this.roomNumberField) && this.checkApplyKey(applyKey));
	}

	private checkApplyKey(key: any) {
		if (typeof key !== "string") {
			return new InsightError("apply key should be string");
		}
		if (key.match("_") !== null) {
			return new InsightError("apply key cannot include underscore");
		} else {
			this.transList.push(key);
			return true;
		}
	}
}
