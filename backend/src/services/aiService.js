function buildStudyResponse(question, subject) {
  return [
    `Topic: ${subject || "General Studies"}`,
    "",
    `Question: ${question}`,
    "",
    "Simple explanation:",
    "1. Start by identifying the core concept behind the question.",
    "2. Break the topic into smaller parts and understand each part one by one.",
    "3. Connect the idea to a real example so it is easier to remember.",
    "",
    "Study tip:",
    "Write the answer in your own words and then explain it aloud as if teaching a friend.",
    "",
    "Next step:",
    "Turn this explanation into 3 quick revision points. This structure is ready for a future quiz-generation feature."
  ].join("\n");
}

function buildPrompt(question, subject) {
  return [
    "You are a helpful study assistant for students.",
    "Give a clear, beginner-friendly explanation.",
    "Keep the structure simple with a short explanation, one example, and one study tip.",
    "Make the answer specific to the student's actual question instead of giving a generic template.",
    `Subject: ${subject || "General Studies"}`,
    `Question: ${question}`
  ].join("\n");
}

async function generateWithGemini(question, subject) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = buildPrompt(question, subject);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || buildStudyResponse(question, subject);
}

async function generateStudyExplanation(question, subject) {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateWithGemini(question, subject);
    } catch (error) {
      console.error("[ai] Falling back from Gemini:", error.message);
    }
  }

  return buildStudyResponse(question, subject);
}

module.exports = { generateStudyExplanation };
