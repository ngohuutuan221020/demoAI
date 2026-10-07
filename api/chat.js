export async function POST(request) {
  try {
    const { message, build } = await request.json();

    if (!message) {
      return Response.json({ error: "Thiếu nội dung câu hỏi." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Chưa cấu hình OPENAI_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const systemPrompt = `
Bạn là trợ lý kỹ thuật PC của Mũi Cà Mau.
Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và thực tế.
Chuyên tư vấn CPU, mainboard, VGA, RAM, SSD, PSU, case, tản nhiệt và cấu hình gaming.
Khi đánh giá cấu hình, hãy kiểm tra:
1. Tương thích CPU/mainboard.
2. RAM và nền tảng DDR4/DDR5.
3. Mức độ cân bằng CPU/GPU.
4. Công suất PSU và độ an toàn.
5. Điểm nghẽn hiệu năng nếu có.
6. Khả năng nâng cấp.
Không được tự bịa giá sản phẩm nếu người dùng chưa cung cấp giá.

Dữ liệu cấu hình người dùng hiện chọn:
${JSON.stringify(build || {}, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
model: "gpt-5-mini",
        instructions: systemPrompt,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message || "OpenAI API trả về lỗi." },
        { status: response.status }
      );
    }

    return Response.json({
      reply: data.output_text || "AI không trả về nội dung."
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Lỗi máy chủ." },
      { status: 500 }
    );
  }
}
