import Link from "next/link";
import { ArrowUpRight, Check, Mic2, Music2, ListMusic, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 via-background to-[#1DB954]/5" />
      
      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1DB954]/20 mb-6">
              <Mic2 className="h-10 w-10 text-[#1DB954]" />
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold mb-8 tracking-tight">
              Turn Your{" "}
              <span className="text-[#1DB954]">
                Spotify
              </span>
              {" "}Into a Karaoke Party
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect your Spotify account and let our AI analyze your playlists to create the perfect karaoke song list for your next party night.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-black bg-[#1DB954] rounded-lg hover:bg-[#1ed760] transition-colors text-lg font-semibold"
              >
                Get Started
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-4 text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1DB954]" />
                <span>One-time payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1DB954]" />
                <span>24-hour access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1DB954]" />
                <span>Unlimited playlists</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-4">
                <Music2 className="h-6 w-6 text-[#1DB954]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Spotify Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect directly to your Spotify account and access all your playlists instantly
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-[#1DB954]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered scoring ranks songs by karaoke suitability and difficulty
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-4">
                <ListMusic className="h-6 w-6 text-[#1DB954]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Export Anywhere</h3>
              <p className="text-sm text-muted-foreground">
                Save your karaoke list back to Spotify or download as CSV
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
