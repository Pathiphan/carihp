/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    // Izinkan semua domain eksternal (untuk gambar HP dari berbagai sumber)
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
};

export default nextConfig;
