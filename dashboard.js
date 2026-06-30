const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
}

let issues = [];

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
async function loadIssues() {

    try {

        const response = await fetch("http://127.0.0.1:8000/api/issues");

        issues = await response.json();

        updateStats();

        displayIssues(issues);

        showMarkers(issues);

    } catch (error) {

        console.error(error);

        alert("Unable to load issues.");

    }

}

loadIssues();
function updateStats() {

    document.getElementById("total").textContent = issues.length;

    document.getElementById("pending").textContent =
        issues.filter(i => i.status === "Pending").length;

    document.getElementById("progress").textContent =
        issues.filter(i => i.status === "In Progress").length;

    document.getElementById("resolved").textContent =
        issues.filter(i => i.status === "Resolved").length;

}
function displayIssues(issueArray) {

    const issueList = document.getElementById("issueList");

    issueList.innerHTML = "";

    issueArray.forEach(issue => {

        const imageUrl = issue.image
            ? `http://127.0.0.1:8000/${issue.image}`
            : "";

        const card = document.createElement("div");

        card.className = "issue-card";

        card.innerHTML = `

            ${issue.image ?
            `<img src="${imageUrl}" alt="Issue Image">`
            : ""}

            <div class="issue-content">

                <h3>${issue.title}</h3>

                <p>${issue.description || ""}</p>

                <p><strong>Category:</strong> ${issue.category}</p>

                <p><strong>Status:</strong> ${issue.status}</p>

                <p><strong>Latitude:</strong> ${issue.latitude}</p>

                <p><strong>Longitude:</strong> ${issue.longitude}</p>

            </div>

        `;

        issueList.appendChild(card);

    });

}
function showMarkers(issueArray) {

    markers.forEach(marker => map.removeLayer(marker));

    markers = [];

    const bounds = [];

    issueArray.forEach(issue => {

        if (!issue.latitude || !issue.longitude) return;

        const lat = parseFloat(issue.latitude);

        const lng = parseFloat(issue.longitude);

        const marker = L.marker([lat, lng])

            .addTo(map)

            .bindPopup(`

                <b>${issue.title}</b><br>

                ${issue.category}<br>

                ${issue.status}

            `);

        markers.push(marker);

        bounds.push([lat, lng]);

    });

    if (bounds.length > 0) {

        map.fitBounds(bounds);

    }

}
document.getElementById("search").addEventListener("input", filterIssues);

document.getElementById("categoryFilter").addEventListener("change", filterIssues);

document.getElementById("statusFilter").addEventListener("change", filterIssues);

document.getElementById("logoutBtn").addEventListener("click", logout);
function filterIssues() {

    const search = document
        .getElementById("search")
        .value
        .toLowerCase();

    const category =
        document.getElementById("categoryFilter").value;

    const status =
        document.getElementById("statusFilter").value;

    const filtered = issues.filter(issue => {

        const titleMatch =
            issue.title.toLowerCase().includes(search);

        const categoryMatch =
            category === "All" ||
            issue.category === category;

        const statusMatch =
            status === "All" ||
            issue.status === status;

        return titleMatch &&
               categoryMatch &&
               statusMatch;

    });

    displayIssues(filtered);

    showMarkers(filtered);

}
function logout() {

    localStorage.removeItem("token");

    alert("Logged out successfully!");

    window.location.href = "login.html";

}