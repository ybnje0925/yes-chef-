import type { NextConfig } from "next";
const config: NextConfig =
  process.env.YES_CHEF_STATIC === "1" ? { output: "export" } : {};
export default config;
