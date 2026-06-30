const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}
const issueForm = document.getElementById("issueForm");
const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");

// Image Preview
imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        preview.style.display = "none";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);

});

// Get User Location
// Initialize Map
const map = L.map("map").setView([20.5937, 78.9629], 5);
// OpenStreetMap Tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);
if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(function(position) {

        map.setView(
            [position.coords.latitude, position.coords.longitude],
            15
        );

    });

}

let marker;

// Click on Map
map.on("click", function(e){

    if(marker){
        map.removeLayer(marker);
    }

    marker = L.marker(e.latlng).addTo(map);

    document.getElementById("latitude").value = e.latlng.lat;
    document.getElementById("longitude").value = e.latlng.lng;

});
           


// Submit Form
issueForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const formData = new FormData();

    formData.append(
        "title",
        document.getElementById("title").value
    );

    formData.append(
        "description",
        document.getElementById("description").value
    );

    formData.append(
        "category",
        document.getElementById("category").value
    );

    formData.append(
        "latitude",
        document.getElementById("latitude").value
    );

    formData.append(
        "longitude",
        document.getElementById("longitude").value
    );

    const imageFile = imageInput.files[0];

    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://127.0.0.1:8000/api/issues",
            {
                method: "POST",
                headers: {
                    Authorization: token || ""
                },
                body: formData
            }
        );

        const data = await response.json();

        alert(data.message);

        issueForm.reset();
        if (marker) {
    map.removeLayer(marker);
    marker = null;
}

        preview.style.display = "none";

        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";

    } catch(error) {

        console.error(error);
        alert("Unable to submit issue.");

    }

});
function logout() {

    localStorage.removeItem("token");

    alert("Logged out successfully.");

    window.location.href = "login.html";

}