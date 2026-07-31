const WAITLIST_URL = "https://script.google.com/macros/s/AKfycbwTGZWjbb1q71DX7QnDMPJksUAoXtvwt4Usl5W0Dy8Jk7N1UGZFJKx82sxwdY35qa-J/exec";

const form = document.getElementById("waitlist-form");
const email = document.getElementById("email");
const username = document.getElementById("username");
const role = document.getElementById("role");
const otherRoleField = document.getElementById("other-role-field");
const otherRole = document.getElementById("other-role");
const newsletter = document.getElementById("newsletter");
const submitButton = document.getElementById("submit-button");
const successCard = document.getElementById("success-card");
const newsletterConfirmation = document.getElementById("newsletter-confirmation");

function setError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    error.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validate(showMessages = false) {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const usernameValid = username.value.trim().length > 0;
    const roleValid = role.value !== "";
    const otherValid = role.value !== "Other" || otherRole.value.trim().length > 0;

    if (showMessages) {
        setError(email, email.value.trim() ? (emailValid ? "" : "Please enter a valid email.") : "Email is required.");
        setError(username, usernameValid ? "" : "Username is required.");
        setError(role, roleValid ? "" : "Please choose your role.");
        setError(otherRole, otherValid ? "" : "Please tell us your role.");
    }

    submitButton.disabled = !(emailValid && usernameValid && roleValid && otherValid);
    return emailValid && usernameValid && roleValid && otherValid;
}

async function submitToWaitlist(username, email, role, newsletter) {
    try {
        const response = await fetch(WAITLIST_URL, {
            method: "POST",
            body: JSON.stringify({ username, email, role, newsletter }),
            headers: { "Content-Type": "text/plain" }
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (err) {
        console.error("Submission failed:", err);
        throw err;
    }
}

[email, username, role, otherRole].forEach((input) => {
    input.addEventListener("input", () => validate(true));
});

role.addEventListener("change", () => {
    const isOther = role.value === "Other";
    otherRoleField.classList.toggle("hidden", !isOther);
    otherRole.required = isOther;
    if (!isOther) setError(otherRole, "");
    validate(true);
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate(true)) return;

    submitButton.disabled = true;
    submitButton.classList.add("loading");

    const submittedRole = role.value === "Other" ? otherRole.value.trim() : role.value;

    try {
        const result = await submitToWaitlist(
            username.value.trim(),
            email.value.trim(),
            submittedRole,
            newsletter.checked
        );

        if (result.result !== "success") {
            throw new Error("The waitlist service did not confirm the submission.");
        }

        form.classList.add("hidden");
        newsletterConfirmation.classList.toggle("hidden", !newsletter.checked);
        successCard.classList.remove("hidden");
        successCard.focus();
    } catch (error) {
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
        setError(email, "We couldn't submit your details right now. Please try again.");
    }
});

validate();