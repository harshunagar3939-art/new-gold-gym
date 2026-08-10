function errorHandler(err, req, res, next) {
  console.error("[error]", err.message || err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry. This record already exists." });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format." });
  }

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong on the server.",
  });
}

module.exports = errorHandler;
