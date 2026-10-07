export async function POST(request) {
  try {
    const { message, build } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Thiếu nội dung câu hỏi." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const systemPrompt = `
Bạn là trợ lý kỹ thuật PC của Mũi Cà Mau.

Nhiệm vụ:
- Tư vấn CPU, mainboard, VGA, RAM, SSD, PSU, case và tản nhiệt.
- Kiểm tra khả năng tương thích linh kiện.
- Đánh giá sự cân bằng của cấu hình.
- Kiểm tra nguồn có phù hợp hay không.
- Phân tích khả năng nâng cấp.
- Tư vấn PC gaming theo ngân sách.
- Trả lời bằng tiếng Việt, dễ hiểu và thực tế.

Không tự bịa giá sản phẩm nếu người dùng chưa cung cấp giá.

Cấu hình người dùng đang chọn:
${JSON.stringify(build || {}, null, 2)}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

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

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") ||
      "Gemini không trả về nội dung.";

    return Response.json({
      reply
    });

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