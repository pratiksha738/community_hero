document.getElementById("signupForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    const user = {

        name: document.getElementById("name").value,

        email: document.getElementById("email").value,

        password: document.getElementById("password").value

    };

    try {

        const response = await fetch("http://127.0.0.1:8000/api/signup", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            window.location.href = "login.html";

        }

    }
    catch (error) {

        console.error(error);

        alert("Signup failed.");

    }

});