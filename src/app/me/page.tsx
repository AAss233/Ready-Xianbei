import { redirect } from "next/navigation";

// 「我的」已改为左侧侧边栏，不再是独立页面；旧路由重定向到首页。
export default function MeRedirect() {
  redirect("/");
}
