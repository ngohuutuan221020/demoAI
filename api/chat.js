export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Thiếu lịch sử trò chuyện." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Chưa cấu hình GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-120b",

          messages: [
            {
              role: "system",
              content: `
Bạn là trợ lý AI của Mũi Cà Mau.
Trả lời bằng tiếng Việt.
Trả lời ngắn gọn, rõ ràng, dễ hiểu.
Ưu tiên trả lời trực tiếp câu hỏi.
Nếu người dùng hỏi về PC, hãy tư vấn chính xác và thực tế.
              `.trim()
            },

            ...messages
          ],

          temperature: 0.5,
          max_completion_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "Groq API trả về lỗi."
        },
        {
          status: response.status
        }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "AI không trả về nội dung." },
        { status: 500 }
      );
    }

    return Response.json({ reply });

  } catch (error) {
    return Response.json(
      {
        error: error.message || "Lỗi máy chủ."
      },
      {
        status: 500
      }
    );
  }
}