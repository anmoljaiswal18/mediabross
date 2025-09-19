// form-handler.js

document.addEventListener("DOMContentLoaded", () => {
  const ENDPOINT = "https://mediabross-backend.onrender.com/api/contact"; // ✅ backend route

  const form = document.getElementById("contact-form");
  if (!form) return;

  // POST helper with timeout
  async function postWithTimeout(url, data, timeout = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const messageField = document.getElementById("message");

    const name = (nameField ? nameField.value : "").trim();
    const email = (emailField ? emailField.value : "").trim();
    const message = (messageField ? messageField.value : "").trim();

    if (!name || !email || !message) {
      alert("Please fill in name, email, and message.");
      return;
    }

    const payload = { name, email, message };

    try {
      const res = await postWithTimeout(ENDPOINT, payload, 10000);

      if (!res) {
        alert("No response from server. Try again later.");
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      let body = null;
      if (contentType.includes("application/json")) {
        body = await res.json().catch(() => null);
      } else {
        body = await res.text().catch(() => null);
      }

      if (res.ok) {
        const successMsg = `Hello ${name}, your message was sent successfully! 💖 Thanks for filling the form.`;
        alert(successMsg);
        form.reset();
      } else {
        alert("Error sending message. Please try again.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Server error. Please try again.");
      }
    }
  });
});
