import { redirect } from "next/navigation";
import { Footer, LoveShell } from "@/components/ui";
import { getViewer } from "@/lib/session";
import { DobForm, EmailForm } from "./forms";

export const metadata = { title: "get started" };

export default async function StartPage() {
  const viewer = await getViewer();
  if (viewer?.profile.dob) redirect(viewer.isVerified ? "/crushes" : "/verify");

  return (
    <LoveShell>
      <h1 className="text-center text-4xl font-black">{viewer ? "Almost there 🎉" : "Let's find out 👀"}</h1>
      <p className="mt-2 text-center font-bold text-white/90">
        {viewer ? "Quick age check first. No Names is 18+." : "Sign in with your email. No passwords, ever."}
      </p>
      <div className="card mt-8 w-full p-6 text-ink">{viewer ? <DobForm /> : <EmailForm />}</div>
      <Steps current={viewer ? 2 : 1} />
      <Footer light />
    </LoveShell>
  );
}

function Steps({ current }: { current: number }) {
  const labels = ["email", "age", "instagram"];
  return (
    <ol className="mt-6 flex gap-2">
      {labels.map((l, i) => (
        <li
          key={l}
          className={`rounded-full px-3 py-1 text-xs font-black ${i + 1 <= current ? "bg-white text-hot" : "bg-white/20 text-white"}`}
        >
          {i + 1}. {l}
        </li>
      ))}
    </ol>
  );
}
