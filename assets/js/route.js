app.get("/contacts-view", (req, res) => {
  res.sendFile(path.join(__dirname, "contacts.html"));
});
