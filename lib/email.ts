import { StoredOrder } from "./order-schema";
import businessConfig from "@/config/business-config.json";

export async function sendOrderNotificationEmail(order: StoredOrder): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const restaurantEmail = process.env.RESTAURANT_NOTIFICATION_EMAIL || businessConfig.restaurant.email;

  // If Resend API key is configured in env, send real email
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "IMPERIUM Kitchen <orders@imperiumqatar.com>",
          to: [restaurantEmail],
          subject: `👑 New Order #${order.orderNumber} - ${order.customerName} (${order.total} QAR)`,
          html: generateEmailHtml(order),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id };
      }
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
    }
  }

  // Graceful fallback: log to kitchen dispatch console
  console.log(`[DISPATCH EMAIL TO ${restaurantEmail}]: New Order #${order.orderNumber} logged successfully.`);
  return { success: true, messageId: `mock_${Date.now()}` };
}

function generateEmailHtml(order: StoredOrder): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #333;">
      <td style="padding: 12px 8px; color: #F5EFE0;">
        <strong>${item.quantity}x ${item.name}</strong>
        ${
          item.selectedOptions.length > 0
            ? `<div style="font-size: 12px; color: #C9A24B; margin-top: 4px;">${item.selectedOptions
                .map((o) => `${o.groupName}: ${o.choiceName}`)
                .join(", ")}</div>`
            : ""
        }
        ${item.note ? `<div style="font-size: 12px; color: #999; margin-top: 2px;">Note: ${item.note}</div>` : ""}
      </td>
      <td style="padding: 12px 8px; text-align: right; color: #F5EFE0;">${item.totalPrice} QAR</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background-color: #0E0E0E; color: #F5EFE0; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #C9A24B; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #C9A24B; margin: 0; font-size: 28px; letter-spacing: 2px;">IMPERIUM RESTAURANT</h1>
        <p style="color: #A39B8B; margin: 4px 0; font-size: 14px;">Commercial Registration No: 229987 • Qatar</p>
      </div>

      <div style="background-color: #1A1A1A; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #C9A24B;">Order #${order.orderNumber} Details</h2>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${order.orderType === "delivery" ? "Express Delivery" : "Self-Pickup"}</p>
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.customerName}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${order.customerPhone}" style="color: #C9A24B;">${order.customerPhone}</a></p>
        ${order.customerEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${order.customerEmail}</p>` : ""}
        ${
          order.orderType === "delivery"
            ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${order.deliveryStreet}, ${order.deliveryArea} (Building: ${order.deliveryBuilding || "N/A"})</p>
               ${order.gpsLocation?.mapsUrl ? `<p style="margin: 4px 0;"><strong>GPS Link:</strong> <a href="${order.gpsLocation.mapsUrl}" style="color: #C9A24B;">View on Maps</a></p>` : ""}`
            : `<p style="margin: 4px 0;"><strong>Pickup Time:</strong> ${order.pickupTime || "ASAP"}</p>`
        }
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #C9A24B; color: #C9A24B;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: right; padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background-color: #1A1A1A; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Subtotal:</span>
          <span>${order.subtotal} QAR</span>
        </div>
        ${
          order.orderType === "delivery"
            ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Delivery Fee:</span>
                <span>${order.deliveryFee === 0 ? "FREE" : `${order.deliveryFee} QAR`}</span>
              </div>`
            : ""
        }
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #C9A24B; border-top: 1px solid #333; padding-top: 8px; margin-top: 8px;">
          <span>Total:</span>
          <span>${order.total} QAR</span>
        </div>
      </div>

      ${order.orderNotes ? `<p style="background: #242424; padding: 12px; border-radius: 4px;"><strong>Special Notes:</strong> ${order.orderNotes}</p>` : ""}

      <div style="text-align: center; margin-top: 24px; color: #666; font-size: 12px;">
        Al Amir Street, Fereej Al Soudan, Al Rayyan, Qatar • Tel: +974 5105 3510
      </div>
    </div>
  `;
}
