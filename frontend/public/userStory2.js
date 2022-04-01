document.getElementById("click-me-button-2").addEventListener("click", handleClickMe);

function handleClickMe() {
	alert("Button Clicked!");
	let year = document.getElementById("Year").value;
	let dept = document.getElementById("Dept").value;

	let queryObj = {
		"WHERE": {
			"AND": [
				{
					"EQ": {
						"courses_year": 2015
					}
				},
				{
					"IS": {
						"courses_dept": "cpsc"
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_year",
				"courses_dept",
				"courses_id",
				"sumCourse"
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": [
					"sumCourse"
				]
			}
		},
		"TRANSFORMATIONS": {
			"GROUP": [
				"courses_dept",
				"courses_year",
				"courses_id"
			],
			"APPLY": [
				{
					"sumCourse": {
						"SUM": "courses_pass"
					}
				}
			]
		}
	};
	queryObj.WHERE.AND[0].EQ.courses_year = parseInt(year);
	queryObj.WHERE.AND[1].IS.courses_dept = dept;


	alert(JSON.stringify(queryObj));
	postData('http://127.0.0.1:4321/query', queryObj)
		.then(data => {
			alert(data); // JSON data parsed by `data.json()` call
			tableCreate(data);
		});

}

// Example POST method implementation:
async function postData (url , data) {
	// Default options are marked with *
	alert(data);
	alert(JSON.stringify(data));
	fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	}).then(response => response.json()).then(data => {
		alert('Success:' + JSON.stringify(data));
		tableCreate(objResort(data));
		return data;
	}).catch((error) => {
			alert ('Error:' + error);
	});
}

function tableCreate(data) {
	alert("Creating Table");
	const body = document.body,
		tbl = document.createElement('table');

	if(document.getElementById("AnswerTable")) {
		document.getElementById("AnswerTable").remove();
	}

	alert("Remove Finished");

	tbl.style.width = '30%';
	tbl.style.border = '1px solid black';
	tbl.id = "AnswerTable";

	const tr = tbl.insertRow();
	const courseName = tr.insertCell();
	courseName.appendChild(document.createTextNode(`Course Name`));
	courseName.style.border = '1px solid black';


	const sumCourse = tr.insertCell();
	sumCourse.appendChild(document.createTextNode(`Passed students`));
	sumCourse.style.border = '1px solid black';

	for (let i = 0; i < data.length; i++) {

		const tr = tbl.insertRow();


		const courseName = tr.insertCell();
		courseName.appendChild(document.createTextNode(`${data[i].courses_dept + data[i].courses_id}`));
		courseName.style.border = '1px solid black';


		const sumCourse = tr.insertCell();
		sumCourse.appendChild(document.createTextNode(`${data[i].sumCourse}`));
		sumCourse.style.border = '1px solid black';


	}
	body.appendChild(tbl);
	return tbl;
}

function objResort(obj) {
	let currentMax = 0;
	let currentObjIndex = 0;
	for (let i = 0; i < obj.length; i++) {
		currentMax = 0;
		currentObjIndex = i;
		for(let j = i; j < obj.length; j++) {
			if(parseInt(obj[j].sumCourse) > currentMax) {
				currentMax = obj[j].sumCourse;
				currentObjIndex = j;
			}
		}
		let tempObj = obj[i];
		obj[i] = obj[currentObjIndex];
		obj[currentObjIndex] = tempObj;
	}
	return obj;
}
