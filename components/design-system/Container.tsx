import * as React from "react";

/** tiny class combiner */
const cx = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

type Surface = "none" | "card" | "muted" | "glass";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Render as a different tag */
  as?: keyof JSX.IntrinsicElements;
  /** Max width breakpoint */
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  /** Horizontal gutters */
  gutter?: "none" | "sm" | "md" | "lg" | "xl";
  /** Vertical padding */
  py?: "none" | "xs" | "sm" | "md" | "lg";
  /** Optional surface styling */
  surface?: Surface;
  /** Soft glow shadow (tokenized) */
  elevation?: boolean;
  /** Tokenized radius (DS) */
  rounded?:
    | "none"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "ds"
    | "ds-xl"
    | "ds-2xl";
  /** Center horizontally (default true) */
  center?: boolean;
  /** Make sticky; number = custom top offset in px */
  sticky?: boolean | number;
  /** Add border dividers */
  divider?: "top" | "bottom" | "both";
  children?: React.ReactNode;
};

const widthMap = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "3xl": "max-w-[88rem]",
  full: "max-w-none",
} as const;

const gutterMap = {
  none: "px-0",
  sm: "px-3 sm:px-4 lg:px-6",
  md: "px-4 sm:px-6 lg:px-8",
  lg: "px-6 sm:px-8 lg:px-10",
  xl: "px-8 sm:px-12 lg:px-16",
} as const;

const pyMap = {
  none: "py-0",
  xs: "py-3",
  sm: "py-6",
  md: "py-10",
  lg: "py-16",
} as const;

const roundedMap = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  ds: "rounded-ds",
  "ds-xl": "rounded-ds-xl",
  "ds-2xl": "rounded-ds-2xl",
} as const;

const surfaceMap = {
  none: "",
  card: "bg-card text-card-foreground border border-border",
  muted: "bg-background/60 border border-border",
  glass:
    "bg-background/60 supports-[backdrop-filter]:backdrop-blur-md border border-border",
} as const;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Tag = "div",
      width = "xl",
      gutter = "md",
      py = "none",
      surface = "none",
      elevation = false,
      rounded = "ds-2xl",
      center = true,
      sticky = false,
      divider,
      className = "",
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const stickyClass = sticky
      ? cx("sticky z-30", typeof sticky === "number" ? "" : "top-0")
      : "";

    const dividerClass =
      divider === "top"
        ? "border-t border-border"
        : divider === "bottom"
          ? "border-b border-border"
          : divider === "both"
            ? "border-y border-border"
            : "";

    return (
      <Tag
        ref={ref}
        className={cx(
          "w-full",
          center && "mx-auto",
          widthMap[width],
          gutterMap[gutter],
          pyMap[py],
          surfaceMap[surface],
          rounded !== "none" && surface !== "none" && roundedMap[rounded],
          elevation && "shadow-glow",
          stickyClass,
          dividerClass,
          className,
        )}
        style={
          sticky && typeof sticky === "number"
            ? { ...style, top: sticky }
            : style
        }
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);

Container.displayName = "Container";
export default Container;
