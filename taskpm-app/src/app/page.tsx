import Image from "next/image";
import styles from "./page.module.css";
import { Dashboard } from "@/app/Dashboard";
import Login from "./Login/Login";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Login />
        
      </main>
      
    </div>
  );
}
