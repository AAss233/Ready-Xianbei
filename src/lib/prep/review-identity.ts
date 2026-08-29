"use client";

// 匿名作者身份（扫码即用，无需登录）：token 标识「我」，用于「只能删自己」。
// 昵称可改，token 一旦生成不变，存 localStorage。

const TOKEN_KEY = "xianbei-review-token";
const NAME_KEY = "xianbei-review-name";

export function getAuthorToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

export function getAuthorName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setAuthorName(name: string) {
  if (typeof window !== "undefined") localStorage.setItem(NAME_KEY, name.trim().slice(0, 24));
}

// 重置本地评价身份（演示重置用）：清除昵称与作者 token，下次会重新生成新身份。
export function resetIdentity() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}
