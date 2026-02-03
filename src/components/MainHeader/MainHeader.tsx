import styles from "./MainHeader.module.css";

type MainHeaderProps = {
  title: string;
  mode?: "light" | "dark";
};

export default function MainHeader({ title, mode = "light" }: MainHeaderProps) {
  return (
    <h1
      className={`${styles.mainHeader} ${
        mode === "dark" ? styles.dark : styles.light
      }`}
    >
      {title}
    </h1>
  );
}
