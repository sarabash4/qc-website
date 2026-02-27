import type { CSSProperties, ReactNode } from "react";

type MainHeaderProps = {
  title: ReactNode;
  mode?: "light" | "dark";
  className?: string;
  style?: CSSProperties;
};

export default function MainHeader({
  title,
  mode = "light",
  className,
  style,
}: MainHeaderProps) {
  return (
    <h1
      className={`
        max-w-[720px] px-[15px] py-[200px] text-left font-medium leading-[1.35] text-[24px]
        ${mode === "dark" ? "text-white" : "text-black"}
        ${className ?? ""}
      `}
      style={{ fontFamily: "var(--font-family-base)", ...style }}
    >
      {title}
    </h1>
  );
}
