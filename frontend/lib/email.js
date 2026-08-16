/**
 * Decoupled transactional email service helper.
 * Uses Resend by default, easily interchangeable.
 */
export async function sendPurchaseEmail({ to, name, downloads, amount }) {
  console.log(`[Email] Sending purchase confirmation email to ${to}...`);

  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const downloadsHtml = downloads
    .map(
      (d) =>
        `<li><strong>${d.productName}</strong>: <a href="${d.downloadUrl}" style="color: #6366f1; text-decoration: underline;">Download Files</a> (Valid for 24h)</li>`
    )
    .join("");

  const textBody = `Hi ${name},\n\nThank you for your purchase (Total Paid: ₹${amount}).\n\nYour download links:\n` +
    downloads.map((d) => `- ${d.productName}: ${d.downloadUrl}`).join("\n") +
    `\n\nEnjoy your assets!\nWaveLabs Support`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
      <h2 style="color: #18181b;">Thank you for your purchase, ${name}!</h2>
      <p style="color: #3f3f46;">Your payment of <strong>₹${amount}</strong> was processed successfully. Here are your secure, direct download links:</p>
      <ul style="padding-left: 20px; margin: 20px 0; line-height: 1.6;">
        ${downloadsHtml}
      </ul>
      <p style="color: #71717a; font-size: 0.85rem;">Note: Download links are secure and will expire in 24 hours. If you need to recover your downloads later, visit the store and click 'Recover Purchases' or contact support.</p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
      <p style="color: #a1a1aa; font-size: 0.8rem; text-align: center;">© WaveLabs Digital Store. All rights reserved.</p>
    </div>
  `;

  if (!apiKey) {
    console.warn("[Email WARNING] EMAIL_API_KEY is not set. Outputting email body to server logs instead:");
    console.log("------------------------------------------");
    console.log(`FROM: ${fromEmail}`);
    console.log(`TO: ${to}`);
    console.log("SUBJECT: Your Digital Purchase — Download Ready");
    console.log("BODY:\n", textBody);
    console.log("------------------------------------------");
    return { success: true, logged: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: "Your Digital Purchase — Download Ready",
        html: htmlBody,
        text: textBody,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Resend API.");
    }

    console.log(`[Email] Email sent successfully. Resend ID: ${data.id}`);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("[Email] Error dispatching email:", error);
    // Return false instead of throwing to prevent database rollback (as instructed)
    return { success: false, error: error.message };
  }
}

/**
 * Sends a purchase recovery link email containing active download links.
 */
export async function sendRecoveryEmail({ to, name, downloads }) {
  console.log(`[Email] Sending recovery email to ${to}...`);

  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const downloadsHtml = downloads
    .map(
      (d) =>
        `<li><strong>${d.productName}</strong>: <a href="${d.downloadUrl}" style="color: #6366f1; text-decoration: underline;">Download Files</a> (Valid for 24h)</li>`
    )
    .join("");

  const textBody = `Hi ${name},\n\nHere are your recovered digital downloads:\n` +
    downloads.map((d) => `- ${d.productName}: ${d.downloadUrl}`).join("\n") +
    `\n\nWaveLabs Support`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
      <h2 style="color: #18181b;">Recover Your Purchases</h2>
      <p style="color: #3f3f46;">Hi ${name}, here are your active secure download links:</p>
      <ul style="padding-left: 20px; margin: 20px 0; line-height: 1.6;">
        ${downloadsHtml}
      </ul>
      <p style="color: #71717a; font-size: 0.85rem;">Note: Download links are secure and will expire in 24 hours.</p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
      <p style="color: #a1a1aa; font-size: 0.8rem; text-align: center;">© WaveLabs Digital Store. All rights reserved.</p>
    </div>
  `;

  if (!apiKey) {
    console.warn("[Email WARNING] EMAIL_API_KEY is not set. Outputting recovery email to server logs:");
    console.log("------------------------------------------");
    console.log(`TO: ${to}`);
    console.log("SUBJECT: Recover Your Digital Purchases");
    console.log("BODY:\n", textBody);
    console.log("------------------------------------------");
    return { success: true, logged: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: "Recover Your Digital Purchases",
        html: htmlBody,
        text: textBody,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send recovery email via Resend.");
    }

    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("[Email] Error dispatching recovery email:", error);
    return { success: false, error: error.message };
  }
}
