// form-handler.js (frontend only, no require)
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

  async function postWithTimeout(url, data, timeout = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

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

  async function sendPayloadWithRetry(payload, opts = {}) {
    const timeout = opts.timeout || 15000;
    const maxAttempts = opts.attempts || 2;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.info(`Attempt ${attempt}/${maxAttempts}`);
        const res = await postWithTimeout(ENDPOINT, payload, timeout);
        return res;
      } catch (err) {
        lastError = err;
        if (err.name === "AbortError") {
          console.warn(`Attempt ${attempt} aborted (timeout).`);
        } else if (err instanceof TypeError) {
          console.warn(`Attempt ${attempt} network error:`, err.message);
        } else {
          throw err;
        }

        if (attempt < maxAttempts) {
          const backoff = 1000 * attempt;
          console.info(`Retrying after ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }
    throw lastError;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const message = (document.getElementById("message")?.value || "").trim();

    if (!name || !email || !message) {
      alert("Please fill in name, email, and message.");
      return;
    }

    const payload = { name, email, message };
    setSubmitting(true);

    try {
      const res = await sendPayloadWithRetry(payload);

      if (!res) {
        alert("No response from server. Try again later.");
        return;
      }

      let bodyText = "";
      const ct = res.headers.get("content-type") || "";
      try {
        bodyText = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
      } catch {}

      if (res.ok) {
        alert(`Hello ${name}, your message was sent successfully! 💖`);
        form.reset();
      } else {
        alert(bodyText || `Server error (${res.status}). Please try again.`);
      }
    } catch (err) {
      console.error("Send failed:", err);
      if (err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Network/Server error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  });
});
