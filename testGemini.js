const API_KEY = "PASTE_YOUR_NEW_KEY_HERE";

// Step 1: Check available models
async function listModels() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}` 
  );

  const data = await res.json();
  console.log("AVAILABLE MODELS:\n", JSON.stringify(data, null, 2));
}

// Step 2: Call Gemini using SAFE model
async function testGemini() {
  const MODEL = "gemini-1.5-flash-001"; // fallback later if needed

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Say hello in one line" }],
          },
        ],
      }),
    }
  );

  const text = await res.text();
  console.log("RAW RESPONSE:\n", text);

  if (!res.ok) {
    throw new Error("❌ API FAILED");
  }

  const data = JSON.parse(text);
  console.log("✅ SUCCESS:\n", data);
}

// Run both
(async () => {
  await listModels();   // VERY IMPORTANT
  await testGemini();   // test call
})();
