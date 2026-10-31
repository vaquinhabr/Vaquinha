import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEmail, validateSignup, parseBRLToCents, slugify } from "../lib/validation.mjs";

test("normalizes email without changing password", () => {
  assert.equal(normalizeEmail("  Pessoa@Exemplo.COM "), "pessoa@exemplo.com");
});

test("validates signup input and rejects short/oversized passwords", () => {
  assert.match(validateSignup({ name: "A", email: "x@example.com", password: "senha123" }), /nome/i);
  assert.match(validateSignup({ name: "Pessoa", email: "nao-e-email", password: "senha123" }), /e-mail/i);
  assert.match(validateSignup({ name: "Pessoa", email: "pessoa@example.com", password: "123" }), /senha/i);
  assert.match(validateSignup({ name: "Pessoa", email: "pessoa@example.com", password: "á".repeat(40) }), /longa/i);
  assert.equal(validateSignup({ name: "Pessoa", email: " Pessoa@Exemplo.com ", password: "UmaSenha123" }), null);
});

test("parses BRL values into integer cents accurately", () => {
  assert.equal(parseBRLToCents("R$ 2.500,00"), 250000);
  assert.equal(parseBRLToCents("2500.00"), 250000);
  assert.equal(parseBRLToCents("12,5"), 1250);
  assert.equal(parseBRLToCents("1.000"), 100000);
  assert.equal(parseBRLToCents("0,99"), null);
  assert.equal(parseBRLToCents("abc"), null);
  assert.equal(parseBRLToCents("1,234"), null);
});

test("slugifies Portuguese titles predictably", () => {
  assert.equal(slugify("Ajude a reconstruir nossa casa!"), "ajude-a-reconstruir-nossa-casa");
  assert.equal(slugify("  Ação & Educação  "), "acao-educacao");
});
