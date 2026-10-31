export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function validateSignup({ name, email, password }) {
  const cleanName = String(name ?? "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password ?? "");

  if (cleanName.length < 2 || cleanName.length > 100) {
    return "Informe seu nome com pelo menos 2 caracteres (máximo de 100).";
  }
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return "Confira se o e-mail foi digitado corretamente.";
  }
  if (cleanPassword.length < 8) {
    return "Escolha uma senha com pelo menos 8 caracteres.";
  }
  if (new TextEncoder().encode(cleanPassword).length > 72) {
    return "Sua senha é muito longa. Use até 72 bytes para garantir compatibilidade segura.";
  }
  return null;
}

/** Parse Brazilian currency strings into integer cents without floating point rounding. */
export function parseBRLToCents(value) {
  let text = String(value ?? "").trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (!text) return null;
  if (!/^[\d.,]+$/.test(text)) return null;

  if (text.includes(",") && text.includes(".")) {
    // Brazilian grouping: 1.234,56
    if (!/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(text)) return null;
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    if (!/^\d+,\d{1,2}$/.test(text)) return null;
    text = text.replace(",", ".");
  } else if (text.includes(".")) {
    const parts = text.split(".");
    if (parts.length > 2) {
      if (!/^\d{1,3}(\.\d{3})+$/.test(text)) return null;
      text = text.replace(/\./g, "");
    } else if (parts[1].length === 3 && parts[0].length <= 3) {
      // In Brazilian notation, 1.000 is more likely a thousands separator.
      text = parts.join("");
    } else if (!/^\d+\.\d{1,2}$/.test(text)) {
      return null;
    }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  return Number.isSafeInteger(cents) && cents >= 100 ? cents : null;
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
