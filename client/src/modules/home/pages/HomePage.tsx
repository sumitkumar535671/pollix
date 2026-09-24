import { Link } from "react-router";
import { useState, type ReactNode } from "react";
import {
    ArrowUpRight,
    BarChart3,
    Check,
    CircleHelp,
    Clock3,
    Layers3,
    Radio,
    Sparkles,
    Users,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { useAuth, SignInButton, SignUpButton } from "@clerk/react";

const choices = ["Ship it this week", "Polish it a little", "Ask the team"];

export default function HomePage() {
    const { isSignedIn } = useAuth();
    const [selectedChoice, setSelectedChoice] = useState(0);

    return (
        <div className="overflow-hidden bg-background">
            <section className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
                <div className="pointer-events-none absolute -left-40 top-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        <Radio className="h-3.5 w-3.5 animate-pulse" /> Live decisions, less noise
                    </div>
                    <h1 className="max-w-3xl text-6xl font-bold leading-[0.94] tracking-[-0.06em] text-foreground sm:text-8xl">
                        Ask better.<br />
                        <span className="text-primary">Move faster.</span>
                    </h1>
                    <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                        Pollix turns quick questions into clear momentum. Create a pulse check, invite your people, and watch the room make up its mind in real time.
                    </p>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        {isSignedIn ? (
                            <Link to="/polls/new"><Button size="lg" className="h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-[5px_5px_0_hsl(var(--foreground))] hover:translate-y-1 hover:shadow-none">Start a poll <ArrowUpRight className="ml-2 h-5 w-5" /></Button></Link>
                        ) : (
                            <SignUpButton mode="modal"><Button size="lg" className="h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-[5px_5px_0_hsl(var(--foreground))] hover:translate-y-1 hover:shadow-none">Start a poll <ArrowUpRight className="ml-2 h-5 w-5" /></Button></SignUpButton>
                        )}
                        <Link to={isSignedIn ? "/dashboard" : "#how-it-works"}><Button variant="outline" size="lg" className="h-14 rounded-full border-2 px-8 text-base font-bold">See how it works</Button></Link>
                    </div>
                    <div className="mt-12 flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex -space-x-2"><span className="h-8 w-8 rounded-full border-2 border-background bg-[#f6b48a]" /><span className="h-8 w-8 rounded-full border-2 border-background bg-[#7da5d8]" /><span className="h-8 w-8 rounded-full border-2 border-background bg-[#d3a6e8]" /></div>
                        <span><strong className="text-foreground">2,400+</strong> teams are asking better questions</span>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
                    <div className="absolute -right-5 -top-7 z-20 rotate-6 rounded-2xl bg-foreground px-4 py-3 text-background shadow-xl"><Sparkles className="mr-2 inline h-4 w-4 text-primary" /> Make it count</div>
                    <div className="relative rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-[14px_14px_0_hsl(var(--primary)/0.18)] sm:p-8">
                        <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Team pulse · live</p><h2 className="mt-2 text-2xl font-bold tracking-tight">What should we ship next?</h2></div><div className="rounded-full bg-primary/10 p-3 text-primary"><CircleHelp className="h-5 w-5" /></div></div>
                        <div className="space-y-3">
                            {choices.map((choice, index) => <button key={choice} type="button" onClick={() => setSelectedChoice(index)} className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${selectedChoice === index ? "border-primary bg-primary/10" : "border-foreground/10 hover:border-primary/50"}`}><span className="flex items-center gap-3 font-semibold"><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selectedChoice === index ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20"}`}>{selectedChoice === index && <Check className="h-4 w-4" />}</span>{choice}</span><span className="text-sm text-muted-foreground">{[48, 31, 21][index]}%</span></button>)}
                        </div>
                        <div className="mt-8 flex items-center justify-between border-t border-foreground/10 pt-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Users className="h-4 w-4" /> 64 responses</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> closes in 2h</span></div>
                    </div>
                    <div className="absolute -bottom-8 -left-8 hidden rounded-2xl border border-foreground/10 bg-card p-4 shadow-lg sm:block"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#ff8066]/15 p-2 text-[#e75c43]"><BarChart3 className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Response rate</p><p className="font-bold">+28.4% <span className="text-xs text-primary">today</span></p></div></div></div>
                </div>
            </section>

            <section id="how-it-works" className="border-y border-foreground/10 bg-foreground py-20 text-background">
                <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">A sharper workflow</p><h2 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">From blank page to shared answer.</h2></div><p className="max-w-sm text-background/60">Everything you need to turn a hunch into a decision your team can see.</p></div><div className="grid gap-px overflow-hidden rounded-2xl border border-background/10 bg-background/10 md:grid-cols-3"><Feature icon={<Layers3 />} number="01" title="Build in seconds" text="Start with a clean question and shape the options without wrestling a form builder." /><Feature icon={<Users />} number="02" title="Bring everyone in" text="Share one link anywhere. Every response lands in one calm, focused space." /><Feature icon={<BarChart3 />} number="03" title="See the signal" text="Live results make the next move obvious, while the conversation is still warm." /></div></div>
            </section>
        </div>
    );
}

function Feature({ icon, number, title, text }: { icon: ReactNode; number: string; title: string; text: string }) {
    return <article className="bg-foreground p-7 transition-colors hover:bg-primary hover:text-primary-foreground"><div className="mb-12 flex items-center justify-between"><span className="rounded-xl border border-background/15 p-3">{icon}</span><span className="font-mono text-sm text-background/45">{number}</span></div><h3 className="mb-3 text-2xl font-bold">{title}</h3><p className="leading-7 text-background/60">{text}</p></article>;
}
