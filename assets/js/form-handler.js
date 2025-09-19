document.getElementById("contact-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    try {
      const response = await fetch("https://mediabross-backend.onrender.com/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("Message sent successfully!");
        document.getElementById("contact-form").reset();
      } else {
        alert("Error sending message. Please try again.");
      }
    } catch (error) {
      alert("Server error. Check console for more info.");
      console.error("Error:", error);
    }
  });

(function () {
  const form = document.getElementById("contact-form");
  if (!form) {
    console.error("contact-form element not found. Make sure your form has id='contact-form'");
    return;
  }

  // List of endpoints to try (in order). Update or add more if your backend uses a different path.
  const ENDPOINTS = [
    "https://mediabross-backend.onrender.com/contact",
    "https://mediabross-backend.onrender.com/api/contact"
  ];

  // helper: POST with timeout using AbortController
  async function postWithTimeout(url, bodyObj, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(bodyObj)
      });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // Try endpoints sequentially; if one returns 404, try the next
  async function tryPostSequence(bodyObj) {
    for (const url of ENDPOINTS) {
      console.log("Trying endpoint:", url);
      try {
        const res = await postWithTimeout(url, bodyObj, 10000);

        // If endpoint missing, try next
        if (res.status === 404) {
          console.warn(`Endpoint ${url} returned 404. Trying next endpoint (if any).`);
          // read text for logs (optional)
          const txt = await res.text().catch(() => null);
          console.debug("404 response body:", txt);
          continue;
        }

        // If we get here, endpoint exists (could be success or server error)
        const contentType = res.headers.get("content-type") || "";
        let body = null;
        if (contentType.includes("application/json")) {
          body = await res.json().catch(() => null);
        } else {
          body = await res.text().catch(() => null);
        }

        return { res, body, url };
      } catch (err) {
        // network error, timeout, or CORS
        console.error(`Request to ${url} failed:`, err);
        // If it's an AbortError (timeout) or network error, we stop trying further endpoints
        // because more attempts are unlikely to fix network issues. But if you prefer to try
        // the next endpoint anyway, comment out the following `return` and let loop continue.
        // For now, continue to try next endpoint (since the user requested automatic fallback).
        continue;
      }
    }

    // No endpoint responded successfully (all 404 or failed)
    return null;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = (document.getElementById("name") || {}).value || "";
    const email = (document.getElementById("email") || {}).value || "";
    const message = (document.getElementById("message") || {}).value || "";

    const data = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    };

    // basic client-side validation
    if (!data.name || !data.email || !data.message) {
      alert("Please fill in name, email and message before sending.");
      return;
    }

    try {
      const result = await tryPostSequence(data);

      if (!result) {
        alert("Error sending message. No endpoint found or network error. Check console for details.");
        return;
      }

      const { res, body, url } = result;
      console.log("Final response from", url, res.status, body);

      if (res.ok) {
        // Success (2xx)
        const serverMsg = (body && body.message) ? body.message : "Message sent successfully!";
        alert(serverMsg);
        form.reset();
      } else {
        // Non-OK (4xx/5xx) — show server message if present
        let errMsg = `Error sending message: ${res.status} ${res.statusText}`;
        if (body) {
          if (typeof body === "string" && body.trim()) errMsg += ` - ${body}`;
          else if (body.message) errMsg += ` - ${body.message}`;
        }
        console.error(errMsg);
        alert("Error sending message. Please try again. Check console for details.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Server error. Check console for more info.");
    }
  });
})();


