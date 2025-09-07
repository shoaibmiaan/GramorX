import React from "react";

export type FooterGridProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export const FooterGrid: React.FC<FooterGridProps> = ({
  className = "",
  children,
  ...rest
}) => {
  const classes = ["grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default FooterGrid;
