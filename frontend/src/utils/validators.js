export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

export const isValidPhone = (phone) => /^[0-9]{10}$/.test((phone || "").replace(/\D/g, "").slice(-10));

export const isValidPincode = (pincode) => /^[0-9]{6}$/.test(pincode || "");
