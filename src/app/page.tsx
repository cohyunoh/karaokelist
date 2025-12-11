import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import { ArrowUpRight, CheckCircle2, Zap, Shield, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let user = null;
  let plans = null;

  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    user = userResult.data.user;

    try {
      const plansResult = await supabase.functions.invoke('supabase-functions-get-plans');
      plans = plansResult.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Continue without plans - show empty pricing section
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Continue without user/plans - show public page
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We're revolutionizing the way teams work with cutting-edge technology and unparalleled service.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", description: "10x faster than traditional solutions" },
              { icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", description: "Bank-grade encryption built-in" },
              { icon: <Users className="w-6 h-6" />, title: "Team Collaboration", description: "Seamless workflow for your entire team" },
              { icon: <CheckCircle2 className="w-6 h-6" />, title: "99.9% Uptime", description: "Reliability you can count on" }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[#1DB954] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$1M+</div>
              <div className="text-blue-100">Funding Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-card" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose the perfect plan for your needs. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans && Array.isArray(plans) && plans.length > 0 ? (
              plans.map((item: any) => (
                <PricingCard key={item.id} item={item} user={user} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                Pricing plans are currently unavailable. Please check back later.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who trust us with their business.</p>
          <a href="/dashboard" className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
