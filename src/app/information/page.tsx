import InformationPage from "./InformationPage";
import CursorImageTrail from "@/src/components/CursorImageTrail";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 cursor-none">
      <CursorImageTrail />
      <InformationPage />
    </main>
  );
}
