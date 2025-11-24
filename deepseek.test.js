// done Please install OpenAI SDK first: `npm install openai`

const env = require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello!" },
      { role: "assistant", content: "Hi there!" },
      { role: "user", content: "What can you do?" },
    ],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();
