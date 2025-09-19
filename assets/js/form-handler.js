// form-handler.js

document.addEventListener("DOMContentLoaded", () => {
  const ENDPOINT = "https://mediabross-backend.onrender.com/api/contact"; // ✅ correct backend route

  const form = document.getElementById("contact-form");
  if (!form) {
    console.error("contact-form not found. Make sure your form has id='contact-form'");
    return;
  }

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

    const name = (document.getElementById("name") || {}).value.trim();
    const email = (document.getElementById("email") || {}).value.trim();
    const message = (document.getElementById("message") || {}).value.trim();

    if (!name || !email || !message) {
      alert("Please fill in name, email, and message.");
      return;
    }

    const payload = { name, email, message };

    try {
      console.log("Posting to", ENDPOINT, payload);
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

      console.log("Server responded:", res.status, body);

      if (res.ok) {
        const successMsg = (body && body.message) ? body.message : "Message sent successfully!";
        alert(successMsg);
        form.reset();
      } else {
        let err = `Error ${res.status} ${res.statusText}`;
        if (body) {
          if (typeof body === "string" && body.trim()) err += ` - ${body}`;
          else if (body.message) err += ` - ${body.message}`;
        }
        console.error(err);
        alert("Error sending message. Check console for details.");
      }
    } catch (err) {
      console.error("Request failed:", err);
      if (err.name === "AbortError") {
        alert("Request timed out. Please check your network and try again.");
      } else {
        alert("Server error. Check console for more info.");
      }
    }
  });
});
