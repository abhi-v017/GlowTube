import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    webpack: (config) => {
        config.resolve.alias['@backend'] = path.resolve(__dirname, '../backend');
        return config;
    },
};

export default nextConfig;
