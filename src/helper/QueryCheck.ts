
import {TestDataset} from "./dataset";

export class QueryCheck {

	private IdList: any[];
	private insightDatasets: TestDataset[];

	constructor(datasets: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = datasets;
		this.IdList = this.listDatasetId();
	}


	public queryCheck(queryRequest: unknown) {
		let query = queryRequest as any;
		if (query === null || query === undefined) {
			return false;
		}
		let where = query["WHERE"];// query.WHERE
		let opt = query["OPTIONS"];
		if (where === undefined || where === null || opt === undefined || opt === null) {
			return false;
		}
		if (!this.checkQueryInitialCourse(query)) {
			return false;
		}
		if (!this.checkQueryWhere(where)) {
			return false;
		}
		if (!this.checkQueryOPTIONS(opt)) {
			return false;
		} else {
			return true;
		}
	}


	private  checkQueryInitialCourse(query: any){
		return (Object.keys(query).length === 2) && (Object.keys(query)[0] === "WHERE")
		&& (Object.keys(query)[1] === "OPTIONS");
	}

	private  checkQueryWhere(where: any)  {
		if(where === null || where === undefined) {
			return false;
		}
		if (Object.keys(where).length > 1) {
			return false;
		}
		if (Object.keys(where).length === 0) {
			return true;
		}
		if(this.checkWHREREFilter(where)) {
			return true;
		} else {
			return false;
		}

	}

	private checkWHREREFilter(where: any): any {
		let filter = Object.keys(where)[0];
		if ((filter === "AND") || (filter === "OR")){
			return this.checkLogic(where[filter]);
		}
		if ((filter === "GT") || (filter === "LT") || (filter === "EQ")){
			return this.checkMCOMPARATOR(where[filter]);
		}
		if ((filter === "IS") ){
			return this.checkIs(where[filter]);
		}
		if ((filter === "NOT") ){
			this.checkWHREREFilter(where["NOT"]);
		} else {
			return false;
		}

	}

	private  checkLogic(filters: any) {
		if (!Array.isArray(filters)) {
			return false;
		} else {
			for(let o of filters) {
				if (Object.keys(o).length !== 0) {
					return this.checkWHREREFilter(o);
				} else {
					return false;
				}
			}
		}

	}

	private  checkMCOMPARATOR(obj: any) {
		if (Object.keys(obj).length !== 1){
			return false;
		} else {
			let key = Object.keys(obj)[0];
			if (key.split("_").length !== 2) {
				return false;
			} else {
				let datasetId = key.split("_") [0];
				let mfield = key.split("_")[1];
				let value = Object.values(obj)[0];
				if (typeof value !== "number") {
					return false;
				}
				if ((mfield === "avg" || mfield === "pass" || mfield === "fail" || mfield === "audit" ||
				mfield === "year")) {
					return this.IdList.includes(datasetId);
				}
			}
		}
	// should also check if the datasedId is valid  and consisitent.
	// if (datasetId != ID) {
	// 	return false
	// }

	}

	private  checkIs(obj: any) {
		if (Object.keys(obj).length !== 1){
			return false;
		} else {
			let key = Object.keys(obj)[0];
			if (key.split("_").length !== 2) {
				return false;
			} else {
				let datasetId = key.split("_") [0];
				let sfield = key.split("_")[1];

				let value = Object.values(obj)[0];

				if ((typeof value !== "string")) {
					return false;
				}
				let subvalues = value.split("*");
				if (subvalues.length > 3 || subvalues.length < 1) {
					return false;
				}
				if (subvalues.length === 3) {
					return (subvalues[0] === "" && subvalues[2] === "");
				}
				if (subvalues.length === 2) {
					return (subvalues[0] === "" || subvalues[1] === "");
				}
				if ((sfield === "dept" || sfield === "id" || sfield === "instructor" || sfield === "title" ||
				sfield === "uuid")) {
					return this.IdList.includes(datasetId);
				}


			}

		}

	}

// we need to make sure the id exist in datasets,
	private listDatasetId() {
		let arr: any = [];
		this.insightDatasets.forEach((obj) => {
			arr.push(obj.id);
		});
		return arr;
	}

	private  checkQueryOPTIONS(opt: any)  {
		if (Object.keys(opt).length < 1 || Object.keys(opt).length > 2) {
			return false;
		}
		if (Object.keys(opt).length === 1 &&  Object.keys(opt)[0] === "COLUMNS") {
			return this.checkColumn(opt["COLUMNS"]);
		}
		if (Object.keys(opt).length === 2 && Object.keys(opt)[0] === "COLUMNS" && Object.keys(opt)[1] === "ORDER") {
			if (!opt["COLUMNS"].includes(opt["ORDER"])) {
				return false;
			} else {
				return (this.checkColumn(opt["COLUMNS"]) && this.checkOrder(opt["ORDER"]));
			}

		} else {
			return false;
		}
	}

	private  checkColumn(col: any) {
		if(!Array.isArray(col)) {
			return false;
		} else {
			let idArrary = [];
			let fieldArrary = [];
			for (let key of col) {
				let datasetId = key.split("_")[0];
				let field = key.split("_")[1];
				if (!(field === "avg" || field === "pass" || field === "fail" || field === "audit" || field === "year"
				|| field === "dept" || field === "id" || field === "instructor" || field === "title" || field
				=== "uuid"
				)) {
					return false;
				} else if (!this.IdList.includes(datasetId)) {
					return false;
				} else {
					fieldArrary.push(field);
					idArrary.push(datasetId);

				}
			}
			if (!(this.allSame(idArrary) )) {
				return false;
			} else {
				return this.checkArrayUnique(fieldArrary);
			}
		}

	}

	private  checkArrayUnique(array: any) {
		return array.length === new Set(array).size;
	}

	private allSame(Arrary: string[]) {
		return Arrary.filter((v,i,a)=>v === a[0]).length === Arrary.length;
	}

	private  checkOrder(ord: any) {
		if (typeof ord !== "string") {
			return false;
		} else {
			let id = ord.split("_") [0];
			let mfield = ord.split("_")[1];
			if (!(mfield === "avg" || mfield === "pass" || mfield === "fail" || mfield === "audit" || mfield === "year"
			)) {
				return false;
			} else {
				return this.IdList.includes(id);
			}
		}

	}
}
