// form-handler.js (improved)

document.addEventListener("DOMContentLoaded", () => {
  const ENDPOINT = "https://mediabross-backend.onrender.com/api/contact";
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = form.querySelector("button[type='submit']");

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Sending..." : "Send Message Now";
  }

  async function postWithTimeout(url, data, timeout = 10000, signal = null) {
    const controller = new AbortController();
    const combinedSignal = signal || controller.signal;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: combinedSignal,
        // mode: "cors" // default is usually fine; add if you customized CORS elsewhere
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  // retry once on network/timeout with exponential backoff
  async function sendPayloadWithRetry(payload, timeout = 10000) {
    try {
      return await postWithTimeout(ENDPOINT, payload, timeout);
    } catch (err) {
      console.warn("First attempt failed:", err);
      // retry once after short delay (backoff)
      await new Promise(r => setTimeout(r, 1500));
      return postWithTimeout(ENDPOINT, payload, timeout * 2);
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

    setSubmitting(true);
    try {
      const res = await sendPayloadWithRetry(payload, 10000);

      if (!res) {
        console.error("No response object returned from fetch.");
        alert("No response from server. Try again later.");
        return;
      }

      // try to get helpful error text if server returns non-2xx
      const ct = res.headers.get("content-type") || "";
      let bodyText = "";
      try {
        bodyText = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
      } catch (parseErr) {
        bodyText = await res.text().catch(() => "");
      }

      if (res.ok) {
        const successMsg = `Hello ${name}, your message was sent successfully! 💖 Thanks for filling the form.`;
        alert(successMsg);
        form.reset();
        console.info("Contact sent successfully:", bodyText || res.status);
      } else {
        console.error("Server returned error", res.status, bodyText);
        // show server-sent message if present, else generic
        const userMsg = bodyText ? `Server: ${truncate(bodyText, 240)}` : `Error sending message (${res.status}). Please try again.`;
        alert(userMsg);
      }
    } catch (err) {
      // better differentiation of errors for developer debugging and user
      console.error("Send failed:", err);
      if (err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Network or server error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  });

  function truncate(str, n) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  }
});
