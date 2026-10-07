export async function POST(request) {
  try {
    const { message, build } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Thiếu nội dung câu hỏi." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Chưa cấu hình GROQ_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const systemPrompt = `
Bạn là trợ lý kỹ thuật PC của Mũi Cà Mau.

Bạn chuyên tư vấn:
- CPU
- Mainboard
- VGA
- RAM
- SSD
- PSU
- Case
- Tản nhiệt
- PC Gaming
- Tương thích linh kiện
- Nâng cấp máy tính

Khi đánh giá cấu hình:
1. Kiểm tra CPU và Mainboard có tương thích không.
2. Kiểm tra DDR4 / DDR5.
3. Đánh giá sự cân bằng CPU và GPU.
4. Kiểm tra công suất PSU.
5. Phát hiện điểm nghẽn.
6. Đề xuất nâng cấp nếu cần.

Trả lời bằng tiếng Việt.
Ngắn gọn, chính xác và dễ hiểu.
Không tự bịa giá sản phẩm.

Cấu hình khách đang chọn:
${JSON.stringify(build || {}, null, 2)}
`;

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
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],

          temperature: 0.7,
          max_completion_tokens: 2048
        })
      }
    );

    const data = await response.json();

    console.log("Groq response:", JSON.stringify(data));

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
        {
          error: "Groq không trả về nội dung."
        },
        {
          status: 500
        }
      );
    }

    return Response.json({
      reply
    });

  } catch (error) {
    console.error("Groq error:", error);

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