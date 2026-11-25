import businessConfig from "@/config/business-config.json";

export interface OperatingStatus {
  isOpen: boolean;
  currentDay: string;
  todayHours: string;
  statusBadge: string;
  nextOpenTime?: string;
  currentTimeInQatar: string;
}

export function getQatarOperatingStatus(): OperatingStatus {
  const timeZone = businessConfig.openingHours.timezone || "Asia/Qatar";
  const now = new Date();

  // Get current day and time formatted in Asia/Qatar
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value.toLowerCase() || "monday";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const currentMinutes = hour * 60 + minute;

  const schedule = businessConfig.openingHours.schedule as Record<
    string,
    { open: string; close: string; display: string }
  >;

  const todayConfig = schedule[weekday] || { open: "11:00", close: "01:00", display: "11:00 AM - 1:00 AM" };

  // Parse open & close
  const [openH, openM] = todayConfig.open.split(":").map(Number);
  const [closeH, closeM] = todayConfig.close.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  // If close is past midnight (e.g. 01:00 or 02:00), it's closeH + 24
  const closeMinutes = (closeH < openH ? closeH + 24 : closeH) * 60 + closeM;

  // Check if current time is within open window (or early morning extension from yesterday)
  let isOpen = false;
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    isOpen = true;
  } else if (closeH < openH && currentMinutes < closeH * 60 + closeM) {
    // Current time is between 00:00 and 01:00/02:00 AM
    isOpen = true;
  }

  // Format 12-hour Qatar time
  const time12Formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const currentTimeInQatar = time12Formatter.format(now);

  return {
    isOpen,
    currentDay: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    todayHours: todayConfig.display,
    statusBadge: isOpen ? "Open Now" : "Closed Now",
    nextOpenTime: isOpen ? undefined : todayConfig.display.split("-")[0].trim(),
    currentTimeInQatar,
  };
}
