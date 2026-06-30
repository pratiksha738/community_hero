document.getElementById("loginForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    const user = {

        email: document.getElementById("email").value,
        password: document.getElementById("password").value

    };

    try {

        const response = await fetch("http://127.0.0.1:8000/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.token);

            alert("Login Successful!");

            window.location.href = "report.html";

        } else {

            alert(data.message || data.error);

        }

    } catch(error) {

        console.error(error);

        alert("Login Failed!");

    }

});