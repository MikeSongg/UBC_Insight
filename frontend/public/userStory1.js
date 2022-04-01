document.getElementById("click-me-button").addEventListener("click", handleClickMe);

function handleClickMe() {
	alert("Button Clicked!");
	alert(document.getElementById("name").value);
	fetch("http://127.0.0.1:4321/echo/haha", )
		.then(function (response) {
			return response.json();
		})
		.then(function (myJson) {
			alert(myJson.result);
		})
		.catch(function (error) {
			alert("Error: " + error);
		});
}
