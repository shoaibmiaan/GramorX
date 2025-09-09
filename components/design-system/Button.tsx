// components/design-system/Button.tsx
import * as React from "react";
import Link from "next/link";

/** tiny class combiner */
const cx = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

/** Visual weight/style of the button */
export type ButtonVariant =
  | "primary"      // solid + primary tone (gradient hook)
  | "secondary"    // solid + secondary tone
  | "accent"       // solid + accent tone (gradient hook)
  | "outline"
  | "soft"
  | "ghost"
  | "link"
  /** New power variants */
  | "solid"        // generic solid; color via `tone`
  | "elevated"     // soft + elevation + subtle border
  | "dashed"       // dashed outline
  | "glass"        // glassy card surface, blur, border
  | "flat"         // minimal filled surface (bg-muted)
  | "link-muted"   // link but lower contrast
  | "chip"         // compact soft pill with tighter padding
  | "toolbar";     // ghost-y, tighter, for toolbars

/** Semantic color family */
export type ButtonTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ButtonShape = "pill" | "rounded" | "square" | "circle";

export type ButtonProps = {
  variant?: ButtonVariant;
  /** Optional tone override (works with all variants) */
  tone?: ButtonTone;
  size?: ButtonSize;
  shape?: ButtonShape; // default 'pill'
  href?: string; // internal Link or external <a>
  external?: boolean; // force external <a>
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string; // default: "Please wait…"
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  animated?: boolean; // enables shine/lift (globals.css: .btn .btn--fx)
  elevateOnHover?: boolean; // soft glow on hover
  iconOnly?: boolean; // square icon button (requires aria-label)
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Sizing */
const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-7 text-lg",
  "2xl": "h-16 px-8 text-xl",
};


/** Shape */
const shapeClasses: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-ds-2xl",
  square: "aspect-square rounded-ds",
  circle: "aspect-square rounded-full",
};

/** Tone → tokenized utilities (safe for JIT) */
const toneTokens = {
  primary: {
    text: "text-primary",
    bg: "bg-primary",
    hoverBg: "hover:bg-primary/90",
    border: "border-primary",
    softBg: "bg-primary/10",
    hoverSoftBg: "hover:bg-primary/15",
    softBorder: "border-primary/20",
  },
  secondary: {
    text: "text-secondary",
    bg: "bg-secondary",
    hoverBg: "hover:bg-secondary/90",
    border: "border-secondary",
    softBg: "bg-secondary/10",
    hoverSoftBg: "hover:bg-secondary/15",
    softBorder: "border-secondary/20",
  },
  accent: {
    text: "text-accent",
    bg: "bg-accent",
    hoverBg: "hover:bg-accent/90",
    border: "border-accent",
    softBg: "bg-accent/10",
    hoverSoftBg: "hover:bg-accent/15",
    softBorder: "border-accent/20",
  },
  success: {
    text: "text-success",
    bg: "bg-success",
    hoverBg: "hover:bg-success/90",
    border: "border-success",
    softBg: "bg-success/10",
    hoverSoftBg: "hover:bg-success/15",
    softBorder: "border-success/20",
  },
  warning: {
    text: "text-goldenYellow",
    bg: "bg-goldenYellow",
    hoverBg: "hover:bg-goldenYellow/90",
    border: "border-goldenYellow",
    softBg: "bg-goldenYellow/10",
    hoverSoftBg: "hover:bg-goldenYellow/15",
    softBorder: "border-goldenYellow/20",
  },
  danger: {
    text: "text-sunsetRed",
    bg: "bg-sunsetRed",
    hoverBg: "hover:bg-sunsetRed/90",
    border: "border-sunsetRed",
    softBg: "bg-sunsetRed/10",
    hoverSoftBg: "hover:bg-sunsetRed/15",
    softBorder: "border-sunsetRed/20",
  },
} as const;

const buildSolid = (t: typeof toneTokens[keyof typeof toneTokens], animated: boolean, hook?: "primary" | "accent") =>
  cx(
    t.bg,
    "text-white",
    t.hoverBg,
    "border border-transparent",
    // gradient/glow hook for solid primaries
    animated && hook ? (hook === "primary" ? "btn-primary" : "btn-accent") : ""
  );

const buildVariant = (
  variant: ButtonVariant,
  toneKey: ButtonTone,
  animated: boolean,
) => {
  const t = toneTokens[toneKey];

  // legacy solid variants (keep BC)
  if (variant === "primary" || variant === "secondary" || variant === "accent") {
    const hook = variant === "primary" ? "primary" : variant === "accent" ? "accent" : undefined;
    return buildSolid(t, animated, hook);
  }

  // new generic solid (works with all tones)
  if (variant === "solid") {
    return buildSolid(t, animated);
  }

  if (variant === "outline") {
    return cx("bg-transparent", t.text, "border", t.border, t.hoverSoftBg);
  }

  if (variant === "dashed") {
    return cx(
      "bg-transparent",
      t.text,
      "border border-dashed",
      t.border,
      t.hoverSoftBg
    );
  }

  if (variant === "soft") {
    return cx(t.softBg, t.text, "border", t.softBorder, t.hoverSoftBg);
  }

  if (variant === "ghost") {
    return cx(
      "bg-transparent border border-transparent",
      t.text,
      t.hoverSoftBg,
    );
  }

  if (variant === "elevated") {
    return cx(
      t.softBg,
      t.text,
      "border",
      t.softBorder,
      "shadow-sm hover:shadow-md",
      t.hoverSoftBg
    );
  }

  if (variant === "glass") {
    return cx(
      "bg-card/60 backdrop-blur-md",
      "border border-border/60",
      "text-card-foreground",
      "hover:bg-card/70"
    );
  }

  if (variant === "flat") {
    return cx(
      "bg-muted text-muted-foreground",
      "hover:bg-muted/90",
      "border border-transparent"
    );
  }

  if (variant === "chip") {
    return cx(
      "bg-muted text-foreground/80",
      "hover:bg-muted/90",
      "border border-border/60"
    );
  }

  if (variant === "toolbar") {
    return cx(
      "bg-transparent text-foreground/90",
      "border border-transparent",
      "hover:bg-muted/60"
    );
  }

  // link (strong)
  if (variant === "link") {
    return cx(
      "bg-transparent p-0 h-auto rounded-none underline underline-offset-4 border-0",
      "hover:opacity-90",
      t.text,
    );
  }

  // link-muted (subtle, no underline until hover)
  if (variant === "link-muted") {
    return cx(
      "bg-transparent p-0 h-auto rounded-none border-0",
      "text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
    );
  }

  // fallback (shouldn’t hit)
  return cx("bg-muted text-foreground border border-transparent");
};

const Spinner: React.FC<{ size?: ButtonSize }> = ({ size = "sm" }) => {
  const dim =
    size === "xs" ? "h-3 w-3" :
    size === "sm" ? "h-4 w-4" :
    size === "md" ? "h-4 w-4" :
    size === "lg" ? "h-5 w-5" :
    size === "xl" ? "h-6 w-6" :
    "h-7 w-7";
  return (
    <span
      role="status"
      aria-hidden="true"
      className={cx(
        "inline-block animate-spin rounded-full border-2 border-foreground/60 border-t-foreground",
        dim,
      )}
    />
  );
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      tone, // optional
      size = "md",
      shape = "pill",
      href,
      external,
      fullWidth,
      loading,
      loadingText = "Please wait…",
      disabled,
      leadingIcon,
      trailingIcon,
      animated = true,
      elevateOnHover = true,
      iconOnly = false,
      className = "",
      children,
      type = "button",
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) => {
    // Derive tone: keep backward compat where variant implies tone
    const derivedTone: ButtonTone =
      tone ??
      (variant === "secondary"
        ? "secondary"
        : variant === "accent"
          ? "accent"
          : "primary");

    const base = cx(
      "inline-flex items-center justify-center select-none font-medium",
      "transition-all duration-200",
      // Use DS ring tokens (shadcn-style)
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      animated && !["link","link-muted"].includes(variant) && "btn btn--fx",
      elevateOnHover && !["link","link-muted"].includes(variant) && "hover:shadow-glow",
      // compact paddings for chip/toolbar (we still apply size height)
      (variant === "chip" || variant === "toolbar") && "px-3"
    );

    // size & shape (link stays unpadded heightless)
    const sizeCls = ["link","link-muted"].includes(variant) ? "" : sizeClasses[size];
    const shapeCls =
      ["link","link-muted"].includes(variant)
        ? ""
        : iconOnly
          ? shapeClasses.square
          : shapeClasses[shape];

    const toneVariantCls = buildVariant(variant, derivedTone, animated);

    const cls = cx(
      base,
      sizeCls,
      shapeCls,
      fullWidth && "w-full",
      toneVariantCls,
      className,
    );

    const inert = disabled || loading;
    const content = (
      <>
        {loading && (
          <span
            className={cx(
              "inline-flex items-center gap-2",
              (variant === "link" || variant === "link-muted") && "gap-1",
            )}
          >
            <Spinner size={size} />
            <span className="sr-only">{loadingText}</span>
          </span>
        )}
        {!loading && leadingIcon ? (
          <span className={cx("inline-flex", !iconOnly && "mr-2")}>{leadingIcon}</span>
        ) : null}
        {!iconOnly && <span>{loading ? loadingText : children}</span>}
        {!loading && trailingIcon ? (
          <span className={cx("inline-flex", !iconOnly && "ml-2")}>{trailingIcon}</span>
        ) : null}
      </>
    );

    const dataAttrs = {
      "data-variant": variant,
      "data-tone": derivedTone,
      "data-size": size,
      "data-loading": loading ? "" : undefined,
    } as const;

    // Icon-only must be labelled
    const computedAriaLabel = iconOnly
      ? (ariaLabel ?? String(children ?? "")) 
      : ariaLabel;

    // Link render (inert when disabled/loading)
    if (href) {
      const isInternal =
        !external && (href.startsWith("/") || href.startsWith("#"));
      const linkProps = {
        "aria-disabled": inert || undefined,
        tabIndex: inert ? -1 : undefined,
        className: inert ? cls + " pointer-events-none" : cls,
        ...dataAttrs,
      };

      if (isInternal) {
        return (
          <Link
            href={href}
            ref={ref as React.Ref<HTMLAnchorElement>}
            aria-label={computedAriaLabel}
            {...linkProps}
          >
            {content}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          ref={ref as React.Ref<HTMLAnchorElement>}
          aria-label={computedAriaLabel}
          {...linkProps}
        >
          {content}
        </a>
      );
    }

    // Button render
    return (
      <button
        type={type}
        className={cls}
        aria-busy={loading || undefined}
        aria-label={computedAriaLabel}
        disabled={disabled || loading}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...dataAttrs}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

/** Simple horizontal group that merges borders & radii nicely */
export const ButtonGroup: React.FC<
  React.PropsWithChildren<{ attached?: boolean; className?: string }>
> = ({ attached = true, className, children }) => {
  // expect Button children
  return (
    <div
      role="group"
      className={cx(
        "inline-flex",
        attached && "rounded-ds-2xl overflow-hidden border border-border",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Button;
