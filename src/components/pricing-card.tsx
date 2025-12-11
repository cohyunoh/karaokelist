"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card";
import { supabase } from "../../supabase/supabase";
import { Clock, Mic2, Music, Sparkles, Check } from "lucide-react";

export default function PricingCard({ item, user }: {
    item: any,
    user: User | null
}) {
    // Handle checkout process
    const handleCheckout = async (priceId: string) => {
        if (!user) {
            // Redirect to login if user is not authenticated
            window.location.href = "/sign-in?redirect=pricing";
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('supabase-functions-create-checkout', {
                body: {
                    price_id: priceId,
                    user_id: user.id,
                    return_url: `${window.location.origin}/dashboard`,
                },
                headers: {
                    'X-Customer-Email': user.email || '',
                }
            });

            if (error) {
                throw error;
            }

            // Redirect to Stripe checkout
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };

    const features = [
        "Connect your Spotify account",
        "Analyze unlimited playlists",
        "AI-powered karaoke scoring",
        "Export to CSV or Spotify",
        "Search & filter songs",
    ];

    return (
        <Card className={`w-full max-w-[400px] relative overflow-hidden ${item.popular ? 'border-2 border-[#1DB954] shadow-xl scale-105' : 'border border-border'}`}>
            {item.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 via-transparent to-[#1DB954]/5" />
            )}
            <CardHeader className="relative text-center pb-2">
                {item.popular && (
                    <div className="px-4 py-1.5 text-sm font-medium text-black bg-[#1DB954] rounded-full w-fit mx-auto mb-4">
                        Best Value
                    </div>
                )}
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-4">
                    <Mic2 className="h-8 w-8 text-[#1DB954]" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{item.name}</CardTitle>
                <div className="flex flex-col items-center gap-1 mt-2">
                    <span className="text-4xl font-bold text-foreground">${item?.amount / 100}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>24-hour access</span>
                    </span>
                </div>
            </CardHeader>
            <CardContent className="relative pt-4">
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-[#1DB954] flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="relative pt-4">
                <Button
                    onClick={async () => {
                        await handleCheckout(item.id)
                    }}
                    className="w-full py-6 text-lg font-semibold bg-[#1DB954] hover:bg-[#1ed760] text-black"
                >
                    Get 24-Hour Access
                </Button>
            </CardFooter>
        </Card>
    )
}