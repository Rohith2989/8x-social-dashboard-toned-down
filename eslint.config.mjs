import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next/**", "node_modules/**"] },
  // a reference to port anywhere: plain <img>, so nothing depends on next/image's loader
  { rules: { "@next/next/no-img-element": "off" } },
];

export default config;
