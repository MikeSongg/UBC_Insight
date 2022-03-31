import JSZip from "jszip";
import {ClassRoomObject, CourseObject, CourseObjectHelper} from "./dataset";
import {InsightError} from "../controller/IInsightFacade";
import {ParseIndex} from "./BuildingHelper";
import {ParseClassRoom} from "./ClassRoomHelper";

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
	let classRoomsSet: ClassRoomObject[] = [];

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
	let buildingList = await ParseIndex(roomIndex);
	console.log("Test.");
	let classRoomPromises: Array<Promise<ClassRoomObject[]>> = [];
	for (let building of buildingList) {
		if(jszip.folder("rooms/") !== undefined && jszip.folder("rooms/") !== null) {
			let JSFileObj = jszip.folder("rooms/")?.file(building.link.slice(2))?.async("text");
			classRoomPromises.push(ParseClassRoom(building, JSFileObj));
		}
	}

	let hasBad: InsightError | undefined;
	await Promise.allSettled(classRoomPromises).then((resultSet) => {
		resultSet.forEach((result) => {
			if(hasBad === undefined) {
				if (result.status === "fulfilled") {
					if (result.value === null || result.value === undefined) {
						hasBad = new InsightError("Encounter an empty file or non-existence.");
					} else {
						for(let room of result.value) {
							classRoomsSet.push(room);
						}
					}
				} else {
					hasBad = result.reason;
				}
			}
		});
	});
	if(hasBad !== undefined){
		return Promise.reject(hasBad);
	} else {
		return Promise.resolve(classRoomsSet);
	}
}

export {CourseObjectParseHelper, ClassRoomObjectParseHelper};
