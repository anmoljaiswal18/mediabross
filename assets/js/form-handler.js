// form-handler.js (final improved version)

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

  // Single attempt with AbortController
  async function postWithTimeout(url, data, timeout = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  // Retry wrapper: retries once on timeout/network error
  async function sendPayloadWithRetry(payload, opts = {}) {
    const timeout = opts.timeout || 15000;
    const maxAttempts = opts.attempts || 2;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.info(`Attempt ${attempt}/${maxAttempts} (timeout ${timeout}ms)`);
        const res = await postWithTimeout(ENDPOINT, payload, timeout);
        return res;
      } catch (err) {
        lastError = err;
        if (err.name === "AbortError") {
          console.warn(`Attempt ${attempt} aborted (timeout).`);
        } else if (err instanceof TypeError) {
          console.warn(`Attempt ${attempt} network error:`, err.message || err);
        } else {
          console.error("Non-network error, not retrying:", err);
          throw err;
        }

        if (attempt < maxAttempts) {
          const backoffMs = 1000 * attempt;
          console.info(`Waiting ${backoffMs}ms before retry...`);
          await new Promise(r => setTimeout(r, backoffMs));
        }
      }
    }
    throw lastError;
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
      const res = await sendPayloadWithRetry(payload, { timeout: 15000, attempts: 2 });

      if (!res) {
        console.error("No response object returned.");
        alert("No response from server. Try again later.");
        return;
      }

      // parse body safely
      const ct = res.headers.get("content-type") || "";
      let bodyText = "";
      try {
        bodyText = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
      } catch {
        bodyText = "";
      }

      if (res.ok) {
        alert(`Hello ${name}, your message was sent successfully! 💖`);
        form.reset();
        console.info("Contact success:", bodyText || res.status);
      } else {
        console.error("Server error:", res.status, bodyText);
        alert(bodyText || `Error ${res.status}. Please try again.`);
      }
    } catch (err) {
      console.error("Final send error:", err);
      if (err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else if (err instanceof TypeError) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  });
});
