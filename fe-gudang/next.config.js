/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
module.exports = {
    env: {
        JWT_SECRET: process.env.JWT_SECRET
    }
}
