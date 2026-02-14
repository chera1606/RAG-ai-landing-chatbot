(async () => {
  try {
    const base = "http://localhost:5010";

    // 1) Register (may return 400 if user exists)
    const reg = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        email: "test@example.com",
        password: "TestPass123",
      }),
    });
    let regJson = null;
    try {
      regJson = await reg.json();
    } catch (e) {}
    console.log("REGISTER", reg.status, regJson);

    // 2) Login
    const login = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "TestPass123",
      }),
    });
    const loginJson = await login.json();
    console.log("LOGIN", login.status, loginJson.success ? "OK" : "FAILED");
    if (!loginJson.success) {
      console.error("Login failed, aborting test");
      process.exit(1);
    }
    const token = loginJson.data.token;

    // 3) Query RAG (streaming)
    const q = await fetch(`${base}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        query:
          "Summarize the concept of artificial intelligence in two sentences.",
      }),
    });

    console.log("QUERY STATUS", q.status);

    if (!q.body) {
      const text = await q.text();
      console.log("Response (non-stream):", text);
      process.exit(0);
    }

    const reader = q.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    console.log("\n--- Streaming response start ---");
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) process.stdout.write(decoder.decode(value));
    }
    console.log("\n--- Streaming response end ---");

    process.exit(0);
  } catch (err) {
    console.error("Test script error:", err);
    process.exit(1);
  }
})();
