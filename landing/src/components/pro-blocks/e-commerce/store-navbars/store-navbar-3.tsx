"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, Search, ShoppingCart, User } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
} from "@icons-pack/react-simple-icons";

const navigation = {
  categories: [
    {
      id: "women",
      name: "Women",
      featured: [
        {
          name: "New Arrivals",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Latest women's fashion and trending styles.",
        },
        {
          name: "Summer Collection",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Women's summer collection and essentials.",
        },
      ],
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "Tops & Blouses", href: "#" },
            { name: "Dresses", href: "#" },
            { name: "Pants & Jeans", href: "#" },
            { name: "Skirts", href: "#" },
            { name: "Sweaters", href: "#" },
            { name: "Jackets & Coats", href: "#" },
            { name: "Activewear", href: "#" },
            { name: "Shop All", href: "#" },
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { name: "Handbags", href: "#" },
            { name: "Jewelry", href: "#" },
            { name: "Watches", href: "#" },
            { name: "Sunglasses", href: "#" },
            { name: "Scarves", href: "#" },
          ],
        },
        {
          id: "brands",
          name: "Featured Brands",
          items: [
            { name: "Elegance Co", href: "#" },
            { name: "Style Maven", href: "#" },
            { name: "Chic Boutique", href: "#" },
            { name: "Modern Lady", href: "#" },
          ],
        },
      ],
    },
    {
      id: "men",
      name: "Men",
      featured: [
        {
          name: "New Arrivals",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Latest men's fashion and essentials.",
        },
        {
          name: "Casual Wear",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Men's casual wear and everyday styles.",
        },
      ],
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "Shirts", href: "#" },
            { name: "T-Shirts & Polos", href: "#" },
            { name: "Pants & Jeans", href: "#" },
            { name: "Shorts", href: "#" },
            { name: "Sweaters", href: "#" },
            { name: "Jackets & Coats", href: "#" },
            { name: "Activewear", href: "#" },
            { name: "Shop All", href: "#" },
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { name: "Watches", href: "#" },
            { name: "Wallets", href: "#" },
            { name: "Belts", href: "#" },
            { name: "Sunglasses", href: "#" },
            { name: "Bags", href: "#" },
          ],
        },
        {
          id: "brands",
          name: "Featured Brands",
          items: [
            { name: "Gentleman's Club", href: "#" },
            { name: "Urban Man", href: "#" },
            { name: "Classic Gent", href: "#" },
            { name: "Modern Wear", href: "#" },
          ],
        },
      ],
    },
    {
      id: "kids",
      name: "Kids",
      featured: [
        {
          name: "New Arrivals",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Latest kids fashion and essentials.",
        },
        {
          name: "Back to School",
          href: "#",
          imageSrc: "https://ui.shadcn.com/placeholder.svg",
          imageAlt: "Back to school collection for kids.",
        },
      ],
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "Tops & T-Shirts", href: "#" },
            { name: "Dresses", href: "#" },
            { name: "Pants & Jeans", href: "#" },
            { name: "Shorts", href: "#" },
            { name: "Sweaters", href: "#" },
            { name: "Jackets", href: "#" },
            { name: "Activewear", href: "#" },
            { name: "Shop All", href: "#" },
          ],
        },
        {
          id: "age",
          name: "Shop by Age",
          items: [
            { name: "Baby (0-2 years)", href: "#" },
            { name: "Toddler (2-4 years)", href: "#" },
            { name: "Little Kids (4-7 years)", href: "#" },
            { name: "Big Kids (7-14 years)", href: "#" },
          ],
        },
        {
          id: "brands",
          name: "Featured Brands",
          items: [
            { name: "Little Ones", href: "#" },
            { name: "Kids Style", href: "#" },
            { name: "Young Fashion", href: "#" },
            { name: "Tiny Trendsetters", href: "#" },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: "About Us", href: "#" },
    { name: "Store Locator", href: "#" },
  ],
};

export default function StoreNavbar3() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD $");

  return (
    <div className="bg-background">
      {/* Promotional Banner */}
      <div className="bg-primary text-primary-foreground text-sm font-medium">
        <div className="container-padding-x relative mx-auto flex h-12 max-w-7xl items-center justify-center">
          <div className="left-6 hidden items-center gap-4 md:absolute md:flex">
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              aria-label="Follow us on Facebook"
            >
              <SiFacebook className="size-4" />
            </Link>
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              aria-label="Follow us on Instagram"
            >
              <SiInstagram className="size-4" />
            </Link>
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              aria-label="Follow us on TikTok"
            >
              <SiTiktok className="size-4" />
            </Link>
          </div>
          <span className="absolute left-1/2 w-full -translate-x-1/2 text-center">
            Free shipping on orders over $75
          </span>
          <div className="absolute right-6 hidden items-center gap-4 md:flex">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-primary-foreground/90 hover:text-primary-foreground flex items-center gap-1 transition-colors">
                {language}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("English")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("Español")}>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("Français")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("Deutsch")}>
                  Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("Italiano")}>
                  Italiano
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-primary-foreground/90 hover:text-primary-foreground flex items-center gap-1 transition-colors">
                {currency}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrency("USD $")}>
                  USD $
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("EUR €")}>
                  EUR €
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("GBP £")}>
                  GBP £
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("JPY ¥")}>
                  JPY ¥
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("CAD $")}>
                  CAD $
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <header className="relative" onMouseLeave={() => setOpenCategory(null)}>
        <nav aria-label="Top" className="border-border border-b">
          <div className="container-padding-x mx-auto max-w-7xl">
            <div className="relative flex h-16 items-center justify-between lg:justify-between">
              {/* Mobile menu button */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <span className="sr-only">Open menu</span>
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full max-w-xs overflow-y-auto p-4 pb-12"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  {/* Mobile Menu Content */}
                  <div className="flex items-center justify-between pt-1 pb-2">
                    <Logo className="size-7" />
                  </div>

                  {/* Tabs for Categories */}
                  <Tabs
                    defaultValue={navigation.categories[0].id}
                    className="mt-4"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      {navigation.categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {navigation.categories.map((category) => (
                      <TabsContent
                        key={category.id}
                        value={category.id}
                        className="space-y-8 px-1 pt-4 pb-8"
                      >
                        {/* Featured Items */}
                        <div className="grid grid-cols-2 gap-x-4">
                          {category.featured.map((item) => (
                            <div
                              key={item.name}
                              className="group relative text-sm"
                            >
                              <div className="bg-muted relative aspect-square w-full overflow-hidden">
                                <Image
                                  src={item.imageSrc}
                                  alt={item.imageAlt}
                                  fill
                                  className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
                                />
                              </div>
                              <Link
                                href={item.href}
                                className="text-foreground mt-4 block font-medium"
                              >
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0 z-10"
                                />
                                {item.name}
                              </Link>
                              <p
                                aria-hidden="true"
                                className="text-muted-foreground mt-1"
                              >
                                Shop now
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Category Sections */}
                        {category.sections.map((section) => (
                          <div key={section.name}>
                            <p className="text-foreground font-medium">
                              {section.name}
                            </p>
                            <ul className="mt-4 flex flex-col space-y-4">
                              {section.items.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Pages */}
                  <div className="border-border space-y-4 border-t px-1 pt-6">
                    {navigation.pages.map((page) => (
                      <Link
                        key={page.name}
                        href={page.href}
                        className="text-foreground block font-medium"
                      >
                        {page.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div
                className="ml-4 flex lg:ml-0"
                onMouseEnter={() => setOpenCategory(null)}
              >
                <Link href="#">
                  <span className="sr-only">Home</span>
                  <Logo className="size-7" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:absolute lg:top-1/2 lg:left-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2 lg:items-center lg:space-x-2">
                {navigation.categories.map((category) => (
                  <button
                    key={category.name}
                    className="group text-foreground hover:bg-accent flex h-10 items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors"
                    onMouseEnter={() => setOpenCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}

                {/* Pages */}
                {navigation.pages.map((page) => (
                  <Link
                    key={page.name}
                    href={page.href}
                    className="text-foreground hover:bg-accent flex h-10 items-center rounded-md px-3 py-1 text-sm font-medium transition-colors"
                    onMouseEnter={() => setOpenCategory(null)}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div
                className="ml-auto flex items-center gap-1 lg:ml-0"
                onMouseEnter={() => setOpenCategory(null)}
              >
                {/* User */}
                <Button variant="ghost" size="icon">
                  <span className="sr-only">User account</span>
                  <User />
                </Button>
                {/* Search */}
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Search</span>
                  <Search />
                </Button>
                <Button variant="ghost">
                  <ShoppingCart />0
                  <span className="sr-only">items in cart, view bag</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mega Menu Portal */}
        {openCategory && (
          <div className="bg-background text-muted-foreground absolute top-full right-0 left-0 z-20 text-sm shadow-lg">
            <div className="bg-background relative">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {navigation.categories.map(
                  (category) =>
                    openCategory === category.id && (
                      <div
                        key={category.id}
                        className="grid grid-cols-2 gap-x-8 gap-y-10 py-12"
                      >
                        {/* Featured Items */}
                        <div className="col-start-2 grid grid-cols-2 gap-x-8">
                          {category.featured.map((item) => (
                            <div
                              key={item.name}
                              className="group relative text-base sm:text-sm"
                            >
                              <div className="bg-muted relative aspect-square w-full overflow-hidden">
                                <Image
                                  fill
                                  alt={item.imageAlt}
                                  src={item.imageSrc}
                                  className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
                                />
                              </div>
                              <Link
                                href={item.href}
                                className="text-foreground mt-6 block font-medium"
                              >
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0 z-10"
                                />
                                {item.name}
                              </Link>
                              <p aria-hidden="true" className="mt-1">
                                Shop now
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Category Sections */}
                        <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                          {category.sections.map((section) => (
                            <div key={section.name}>
                              <p className="text-foreground font-medium">
                                {section.name}
                              </p>
                              <ul className="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
                                {section.items.map((item) => (
                                  <li key={item.name} className="flex">
                                    <Link
                                      href={item.href}
                                      className="hover:text-foreground transition-colors"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
