import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold tracking-[-0.01em] shadow-none outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:border-primary/90 hover:bg-primary/90",
        cta: "group gap-3 border-primary bg-primary pl-6 pr-2 text-primary-foreground hover:border-primary/90 hover:bg-primary/90",
        ctaOutline: "group gap-3 border-primary bg-primary pl-6 pr-2 text-primary-foreground hover:border-primary/90 hover:bg-primary/90",
        destructive: "border-destructive/25 bg-destructive/[0.08] text-destructive hover:border-destructive/45 hover:bg-destructive hover:text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border-primary/25 bg-transparent text-primary hover:border-primary/45 hover:bg-primary/[0.08] dark:border-primary/40 dark:bg-transparent dark:hover:bg-primary/15",
        secondary: "border-primary bg-primary text-primary-foreground hover:border-primary/90 hover:bg-primary/90",
        ghost: "border-transparent bg-transparent text-primary hover:border-primary/15 hover:bg-primary/[0.06]",
        link: "h-auto border-transparent bg-transparent px-1 text-primary underline-offset-4 hover:translate-y-0 hover:underline",
      },
      size: {
        default: "min-h-10 px-5 py-2 has-[>svg]:pl-4",
        sm: "min-h-9 gap-1.5 px-4 py-1.5 has-[>svg]:pl-3",
        lg: "min-h-12 px-7 py-2.5 text-[0.9375rem] has-[>svg]:pl-5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" data-variant={variant ?? "default"} data-size={size ?? "default"} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

function ButtonArrow() {
  return <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_0_1px_rgba(4,53,43,0.08)] transition-transform duration-200 group-hover:translate-x-0.5"><ArrowRight className="size-4" strokeWidth={2} /></span>;
}

export { Button, ButtonArrow, buttonVariants };
