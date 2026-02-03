"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

function getKosovoTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Tirane", // Kosovo time
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default function Header() {
  const [time, setTime] = useState(getKosovoTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getKosovoTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerLeft}>Qendrim Caka</div>
      <div className={styles.headerRight}>
        <div>{time} XK</div>

        <Link href="/information">Information</Link>
        <Link href="/playground">Playground</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </header>
  );
}
