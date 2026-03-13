export async function sendWhatsappTemplate(to: string, templateName: string, variables: string[] = []) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) throw new Error("WhatsApp credentials missing");

  const response = await fetch(`${process.env.WHATSAPP_API_BASE_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "pt_BR" },
        components: [{ type: "body", parameters: variables.map((text) => ({ type: "text", text })) }]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp send failed with status ${response.status}`);
  }

  return response.json();
}
