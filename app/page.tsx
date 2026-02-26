import Link from "next/link";

const APP_STORE_URL = "https://apps.apple.com/us/app/tap-tools-pro/id6736921877";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <main className="flex flex-col items-center text-center max-w-md">
        {/* Logo */}
        <div className="mb-10">
          <img
            src="/tap.png"
            alt="tap"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 lowercase">tap</h1>
        <p className="text-lg text-white/80 mb-10 leading-relaxed lowercase">
          your digital business card. create a profile, share your link, and connect seamlessly—built for networking that just works.
        </p>
        <Link
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-base h-12 px-8 hover:bg-white/90 transition-colors lowercase"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M12.08 5.5c.73-.83 1.94-1.46 2.94-1.5.07 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          download on the app store
        </Link>
        <p className="text-sm text-white/50 mt-8 lowercase">
          create your profile in the app, then share tapcards.us/username
        </p>
      </main>
    </div>
  );
}
