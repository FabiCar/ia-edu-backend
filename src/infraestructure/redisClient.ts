import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://chatbot-redis:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Conectado a Redis");
  } catch (err) {
    console.error("❌ Error conectando a Redis:", err);
  }
})();

export default redisClient;