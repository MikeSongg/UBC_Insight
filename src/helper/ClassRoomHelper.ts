import {parse} from "parse5";
import {InsightError} from "../controller/IInsightFacade";
import {BuildingObject, ClassRoomObject, HTMLObject} from "./dataset";

async function ParseClassRoom(building: BuildingObject, classroomsObj: Promise<string> | undefined):
Promise<ClassRoomObject[]> {
	let htmlObj: HTMLObject;
	if(await classroomsObj === undefined || await classroomsObj === null) {
		return Promise.reject(new InsightError("Null Object."));
	} else {
		htmlObj = parse(await classroomsObj as string) as HTMLObject;
	}

	let tbody: HTMLObject;
	if(htmlObj.childNodes === undefined) {
		return Promise.reject("Empty classroom HTML object. ");
	} else {
		let result = tbodyFinder(htmlObj.childNodes);
		if(result === undefined) {
			return [];
		}
		tbody = result;
	}
	return Promise.resolve(tbodyParser(building, tbody));
}

function tbodyFinder(htmlObjects: HTMLObject[]): HTMLObject | undefined {
	for (let i of htmlObjects) {
		if(i.childNodes !== undefined) {
			let result = tbodyFinder(i.childNodes);
			if(result !== undefined) {
				return result;
			}
		}
		if(i.nodeName === "tbody" && i.childNodes !== undefined) {
			return i;
		}
	}
	return undefined;
}

function tbodyParser(building: BuildingObject, tbodyObj: HTMLObject): ClassRoomObject[]{
	let classRoomObjs: ClassRoomObject[] = [];
	for (let i of tbodyObj.childNodes ?? []) {
		let seats: number = -1, roomNum: string = "", type: string = "", furniture: string = "", href: string = "";
		if(i.nodeName === "tr" && i.childNodes !== undefined) {
			for(let classRoomAttrs of i.childNodes) {
				if(classRoomAttrs.attrs !== undefined && classRoomAttrs.childNodes !== undefined) {
					for(let attrs of classRoomAttrs.attrs) {
						if(attrs.value === "views-field views-field-field-room-number") {
							if(classRoomAttrs.childNodes[1] !== undefined
								&& classRoomAttrs.childNodes[1].childNodes !== undefined
								&& classRoomAttrs.childNodes[1].childNodes[0].value !== undefined){
								roomNum = classRoomAttrs.childNodes[1]?.childNodes[0]?.value ?? "";
								classRoomAttrs.childNodes[1]?.attrs?.forEach((attr) => {
									if(attr.name === "href"){
										href = attr.value;
									}
								});
							}
						} else if (attrs.value === "views-field views-field-field-room-capacity") {
							seats = parseInt(classRoomAttrs.childNodes[0].value?.slice(1).trim() ?? "0", 10);
						} else if (attrs.value === "views-field views-field-field-room-furniture") {
							furniture = classRoomAttrs.childNodes[0].value?.slice(1).trim() ?? "";
						} else if (attrs.value === "views-field views-field-field-room-type") {
							type = classRoomAttrs.childNodes[0].value?.slice(1).trim() ?? "";
						}
					}
				}
			}
		}
		if(roomNum !== "" ) {
			let newClassRoom = {
				fullname: building.building,
				shortname: building.code,
				number: roomNum,
				name: building.code + "_" + roomNum,
				address: building.address,
				lat: building.lat,
				lon: building.lon,
				seats: seats,
				type: type,
				furniture: furniture,
				href: href,
			} as ClassRoomObject;
			classRoomObjs.push(newClassRoom);
		}
	}
	return classRoomObjs;
}

export {ParseClassRoom};
