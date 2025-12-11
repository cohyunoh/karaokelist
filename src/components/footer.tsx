import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-muted-foreground hover:text-[#1DB954]">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-[#1DB954]">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-[#1DB954]">Dashboard</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">API</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Press</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Documentation</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Community</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Status</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Privacy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Terms</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Security</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#1DB954]">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="text-muted-foreground mb-4 md:mb-0">
            © {currentYear} Your Company. All rights reserved.
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
