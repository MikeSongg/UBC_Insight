import JSZip from "jszip";
import {ClassRoomObject, CourseObject, CourseObjectHelper} from "./dataset";
import {InsightError} from "../controller/IInsightFacade";
import {ParseIndex} from "./buildingHelper";

/**
 * This is a helper function for parsing course objects.
 * This is a complicate function, please check comments inside.
 * @param jszip JSZip
 * @return Promise<Map<string, string>>
 */
async function CourseObjectParseHelper(jszip: JSZip): Promise<CourseObject[]> {
	/** NOTE: Map < key, Object> */
	let a = new Array<CourseObject>();

	/** This set of Promises contains the Promise of every file parsing. */
	let PromiseSet: Array<Promise<boolean>> = [];

	/** Reject if the folder is empty */
	const fileList = await jszip.folder("courses/")?.files;
	if (fileList === undefined) {
		return Promise.reject(new InsightError("File Reading Error"));
	} else if (Object.keys(fileList).length === 1) {
		return Promise.reject(new InsightError("Empty folder"));
	}

	/** Traverse the fileList. */
	for (let file in fileList) {
		if (file !== "courses/" && file.indexOf("courses/") === 0) {
			/** Exclude the root folder. Make sure file comes from courses folder.*/
			PromiseSet.push(
				jszip.files[file].async("text")?.then((str) => {
					if (str === "") {
						/** Found an empty json file. */
						return Promise.reject();
					} else {
						/** File ok, parse and push. */
						let sectionList = JSON.parse(str).result as object[];
						for (let section in sectionList) {
							a.push(CourseObjectHelper(sectionList[section]));
						}
						return true;
					}
				}).catch((e) => {
					/** throw the exception to higher level. */
					return Promise.reject(e);
				})
			);
		}
	}

	/** Wait for all Promise to finish and return, then check if empty file exists. */
	let hasBlank = await Promise.allSettled(PromiseSet).then((resultSet) => {
		return resultSet.every((result) =>
			result.status === "rejected"
		);
	});

	if (hasBlank) {
		/** Reject if contains empty file. */
		return Promise.reject(new InsightError("Blank File"));
	} else {
		/** Files good, return the object hashmap */
		return Promise.resolve(a);
	}
}

async function ClassRoomObjectParseHelper(jszip: JSZip): Promise<ClassRoomObject[]> {
	/** NOTE: Map < key, Object> */
	let classRooms = new Array<CourseObject>();

	/** Reject if the folder is empty */
	const fileList = await jszip.folder("rooms")?.files;
	if (fileList === undefined) {
		return Promise.reject(new InsightError("File Reading Error"));
	} else if (Object.keys(fileList).length === 1) {
		return Promise.reject(new InsightError("Empty folder"));
	}

	let roomIndex = await jszip.files["rooms/index.htm"]?.async("text")?.then((str) => {
		return str;
	});
	let requiredRoomList = await ParseIndex(roomIndex);

	/* for(let file in requiredRoomList) {
		if(file !== "rooms/" && file.indexOf("rooms/") === 0) {
			PromiseSet.push(
				jszip.files[file].async("text")?.then((str) => {
					if(str === "") {
						return Promise.reject();
					} else {
						let sectionList = JSON.parse(str).result as object[];
						for(let section in sectionList) {
							// a.push(ClassRoomObjectHelper(sectionList[section]));
						}
						return true;
					}
				}).catch((e) => {
					return Promise.reject(e);
				})
			);
		}
	} */
	return Promise.resolve([]);
}

export {CourseObjectParseHelper, ClassRoomObjectParseHelper};
