import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const navigationItems = [
  { title: "Explore", href: "/" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Compare", href: "/compare" },
  // { title: "About", href: "/about" },
  // { title: "Contact", href: "/contact" },
];

export function Navbar() {
  const { isAuthenticated: isLoggedIn, logout, user } = useAuthStore();
  const currentPath = useLocation();
  const isActive = (path: string) => currentPath.pathname === path;
  return (
    <header className="sticky top-0 z-50 w-full  border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-14 items-center justify-between px-4  lg:px-12">
        <div className="flex items-center md:w-1/4">
          <Link to="/" className="font-bold text-primary text-lg">
            YOUOCEANS
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-10">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={`${isActive(item.href) ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center justify-end gap-4 md:w-1/4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] bg-gradient-to-br from-primary/30 to-background/90 shadow-2xl"
            >
              <nav className="flex flex-col gap-6  py-6">
                <Link to="/" className="flex items-center space-x-3">
                  <span className="font-extrabold text-primary text-3xl tracking-wide">
                    YOUOCEANS
                  </span>
                </Link>

                <div className="flex flex-col space-y-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="flex items-center text-lg font-medium text-muted-foreground hover:text-primary p-4 hover:bg-muted rounded-lg shadow-sm transition-all duration-300 ease-in-out"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="flex items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profileImage}
                        alt={user?.email || "User avatar"}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit" className="cursor-pointer w-full">
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
