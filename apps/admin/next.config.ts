import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // THE LIBRARY reads references/*.md and *.pdf off the disk at request
  // time (lib/library-read). They sit at the monorepo root, outside this
  // app, so the function bundle would not carry them without this.
  outputFileTracingIncludes: {
    "/library/[slug]": ["../../references/*.md"],
    "/library/file/[name]": ["../../references/*.pdf"],
  },
};

export default nextConfig;
