import createNextIntlPlugin from "next-intl/plugin";
import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  }
};

export default createNextIntlPlugin()(nextConfig);
