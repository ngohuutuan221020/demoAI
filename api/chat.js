export async function POST(request) {
  try {
    const { message, build } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Thiếu nội dung câu hỏi." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const systemPrompt = `
Bạn là trợ lý kỹ thuật PC của Mũi Cà Mau.

Bạn chuyên:
- CPU
- Mainboard
- VGA
- RAM
- SSD
- PSU
- Case
- Tản nhiệt
- Tư vấn PC Gaming
- Kiểm tra tương thích linh kiện
- Đánh giá cấu hình
- Tư vấn nâng cấp

Khi đánh giá cấu hình:
1. Kiểm tra CPU và Mainboard có tương thích không.
2. Kiểm tra DDR4 / DDR5.
3. Đánh giá CPU và GPU có cân bằng không.
4. Kiểm tra công suất PSU.
5. Tìm điểm nghẽn hiệu năng.
6. Đề xuất nâng cấp nếu cần.

Trả lời bằng tiếng Việt.
Trả lời rõ ràng, thực tế, dễ hiểu.
Không tự bịa giá nếu người dùng chưa cung cấp giá.

Cấu hình hiện tại của khách:
${JSON.stringify(build || {}, null, 2)}
`;

    const input = `
${systemPrompt}

Câu hỏi của khách:
${message}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input: input
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", JSON.stringify(data));

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "Gemini API trả về lỗi."
        },
        {
          status: response.status
        }
      );
    }

    const reply = data?.output_text;

    if (!reply) {
      return Response.json(
        {
          error: "Gemini không trả về output_text."
        },
        {
          status: 500
        }
      );
    }

    return Response.json({
      reply: reply
    });

  } catch (error) {
    console.error("Gemini error:", error);

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