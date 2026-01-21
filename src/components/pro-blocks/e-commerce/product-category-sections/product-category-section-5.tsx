import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductCategorySection5Props {
  tagline?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function ProductCategorySection5({
  tagline = "Trending Now",
  title = "Men's Apparel",
  description = "Discover our latest collection of men's apparel. From casual wear to formal attire, we have you covered.",
  imageUrl = "https://ui.shadcn.com/placeholder.svg",
  buttonText = "Shop all",
  buttonHref = "#",
}: ProductCategorySection5Props) {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12">
        <Link
          href={buttonHref}
          className="bg-muted flex flex-col md:flex-row md:items-center"
        >
          <div className="relative aspect-square w-full overflow-hidden lg:w-1/3">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="flex w-full flex-col gap-5 p-5 md:p-8 lg:w-2/3">
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm leading-5">
                {tagline}
              </p>
              <h2 className="text-foreground heading-lg">{title}</h2>
              <p className="text-muted-foreground text-base leading-6">
                {description}
              </p>
            </div>
            <Button variant="outline" className="w-fit">
              {buttonText}
            </Button>
          </div>
        </Link>
      </div>
    </section>
  );
}
