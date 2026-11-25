import { StoredOrder } from "./order-schema";
import businessConfig from "@/config/business-config.json";

export function generateWhatsAppOrderMessage(order: StoredOrder): string {
  const isDelivery = order.orderType === "delivery";
  const typeText = isDelivery ? "🛵 EXPRESS DELIVERY" : "🛍️ SELF-PICKUP / TAKEAWAY";

  let lines: string[] = [];
  lines.push(`👑 *IMPERIUM RESTAURANT - NEW ORDER*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*Order No:* #${order.orderNumber}`);
  lines.push(`*Type:* ${typeText}`);
  lines.push(`*Customer:* ${order.customerName}`);
  lines.push(`*Phone:* ${order.customerPhone}`);
  if (order.customerEmail) {
    lines.push(`*Email:* ${order.customerEmail}`);
  }

  lines.push(``);
  lines.push(`📋 *ORDER ITEMS:*`);
  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. *${item.quantity}x ${item.name}* (${item.totalPrice} ${order.currency})`);
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      const opts = item.selectedOptions.map((o) => `${o.groupName}: ${o.choiceName}`).join(", ");
      lines.push(`   └ _${opts}_`);
    }
    if (item.note) {
      lines.push(`   └ 📝 Note: _${item.note}_`);
    }
  });

  lines.push(``);
  lines.push(`💰 *BILLING SUMMARY:*`);
  lines.push(`• Subtotal: ${order.subtotal} ${order.currency}`);
  if (isDelivery) {
    lines.push(`• Delivery Fee: ${order.deliveryFee === 0 ? "FREE" : `${order.deliveryFee} ${order.currency}`}`);
  }
  lines.push(`• *Total Payable:* *${order.total} ${order.currency}*`);
  lines.push(`• Payment: *${order.paymentMethod === "cash" ? "Cash on Delivery" : order.paymentMethod === "card_on_delivery" ? "Card on Delivery" : "Paid Online"}*`);

  lines.push(``);
  if (isDelivery) {
    lines.push(`📍 *DELIVERY ADDRESS:*`);
    lines.push(`• Area: ${order.deliveryArea || "N/A"}`);
    lines.push(`• Street: ${order.deliveryStreet || "N/A"}`);
    if (order.deliveryBuilding) lines.push(`• Building/Villa: ${order.deliveryBuilding}`);
    if (order.deliveryLandmark) lines.push(`• Landmark: ${order.deliveryLandmark}`);
    if (order.gpsLocation?.mapsUrl) {
      lines.push(`• 🌐 *GPS Location:* ${order.gpsLocation.mapsUrl}`);
    }
  } else {
    lines.push(`⏰ *PICKUP SCHEDULE:*`);
    lines.push(`• Timing: ${order.pickupTime || "As Soon As Possible (~20 mins)"}`);
    lines.push(`• Pickup Location: Al Amir Street, Fereej Al Soudan, Al Rayyan`);
  }

  if (order.orderNotes) {
    lines.push(``);
    lines.push(`📝 *KITCHEN INSTRUCTIONS:*`);
    lines.push(`_${order.orderNotes}_`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Live Status: https://imperiumqatar.com/order/${order.orderNumber}`);

  return lines.join("\n");
}

export function getWhatsAppOrderUrl(order: StoredOrder): string {
  const phone = businessConfig.restaurant.whatsapp.replace(/[^0-9]/g, "");
  const text = generateWhatsAppOrderMessage(order);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
