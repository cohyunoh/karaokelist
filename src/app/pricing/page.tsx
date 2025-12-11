import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";
import { Mic2, Music2, Sparkles, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Pricing() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: plans, error } = await supabase.functions.invoke('supabase-functions-get-plans');
    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1DB954]/20 mb-4">
                        <Mic2 className="h-8 w-8 text-[#1DB954]" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Get Your Karaoke Pass</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        One simple payment for 24 hours of unlimited karaoke list generation. 
                        Perfect for your next party night!
                    </p>
                </div>

                <div className="flex justify-center">
                    {plans?.map((item: any) => (
                        <PricingCard key={item.id} item={item} user={user} />
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center p-6 rounded-lg bg-card border border-border">
                        <Music2 className="h-10 w-10 text-[#1DB954] mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Spotify Integration</h3>
                        <p className="text-sm text-muted-foreground">
                            Connect directly to your Spotify playlists
                        </p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-card border border-border">
                        <Sparkles className="h-10 w-10 text-[#1DB954] mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Smart Scoring</h3>
                        <p className="text-sm text-muted-foreground">
                            AI analyzes songs for karaoke suitability
                        </p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-card border border-border">
                        <Clock className="h-10 w-10 text-[#1DB954] mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">24-Hour Access</h3>
                        <p className="text-sm text-muted-foreground">
                            Generate unlimited lists for your party
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}