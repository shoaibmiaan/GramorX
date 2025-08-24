import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';


const button = cva(
'pr-inline-flex pr-items-center pr-justify-center pr-rounded-xl pr-font-medium pr-transition pr-duration-150 pr-select-none focus-visible:pr-outline-none focus-visible:pr-ring-2 focus-visible:pr-ring-[var(--pr-primary)] pr-border pr-border-transparent',
{
variants: {
variant: {
primary: 'pr-bg-[var(--pr-primary)] pr-text-[var(--pr-on-primary)] hover:pr-opacity-95',
outline: 'pr-bg-transparent pr-text-[var(--pr-fg)] pr-border-[var(--pr-border)] hover:pr-bg-[color-mix(in oklab,var(--pr-card),white 6%)]',
ghost: 'pr-bg-transparent hover:pr-bg-[var(--pr-card)]',
danger: 'pr-bg-[var(--pr-danger)] pr-text-black hover:pr-opacity-95',
},
size: {
sm: 'pr-h-9 pr-px-3 pr-text-sm',
md: 'pr-h-10 pr-px-4 pr-text-sm',
lg: 'pr-h-12 pr-px-5 pr-text-base',
},
},
defaultVariants: { variant: 'primary', size: 'md' },
}
);


export type PrButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button> & { asChild?: boolean };


export const PrButton = React.forwardRef<HTMLButtonElement, PrButtonProps>(function PrButton(
{ className, variant, size, ...props }, ref
) {
return <button ref={ref} className={twMerge(button({ variant, size }), className)} {...props} />;
});