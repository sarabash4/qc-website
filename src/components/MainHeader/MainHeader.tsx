type MainHeaderProps = {
  title: string;
  mode?: "light" | "dark";
};

export default function MainHeader({ title, mode = "light" }: MainHeaderProps) {
  return (
    <h1
      className={`
        max-w-[720px] py-[200px] text-left font-medium leading-[1.35] text-[24px]
        ${mode === "dark" ? "text-white" : "text-black"}
      `}
      style={{ fontFamily: "var(--font-family-base)" }}
    >
      {title}
    </h1>
  );
}
