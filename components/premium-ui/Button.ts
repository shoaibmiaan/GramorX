import { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={[
        "pr-inline-flex pr-items-center pr-justify-center pr-gap-2",
        "pr-rounded-2xl pr-px-5 pr-py-2.5 pr-font-semibold",
        "pr-bg-primary pr-text-primaryFg hover:pr-opacity-95 active:pr-scale-[.99]",
        "pr-border pr-border-border pr-shadow-soft pr-transition",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
