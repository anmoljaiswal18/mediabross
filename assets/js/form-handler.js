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

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true }); // adds createdAt and updatedAt fields

