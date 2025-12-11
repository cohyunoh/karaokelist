import Link from 'next/link'
import { createClient } from '../../supabase/server'
import { Button } from './ui/button'
import { Mic2 } from 'lucide-react'
import UserProfile from './user-profile'

export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await (await supabase).auth.getUser()


  return (
    <nav className="w-full border-b border-border bg-background py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2 text-xl font-bold">
          <Mic2 className="h-6 w-6 text-[#1DB954]" />
          <span>KaraokeList</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold">
                  Dashboard
                </Button>
              </Link>
              <UserProfile  />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-semibold text-black bg-[#1DB954] rounded-md hover:bg-[#1ed760]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
