"use client";

import messages from "@/messages/fr.json";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = messages.ErrorPage.global;

    return (
        <html lang="fr">
            <body>
                <main className="flex flex-col flex-1 justify-center mx-auto px-5 py-16 w-full max-w-xl min-h-svh">
                    <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t.eyebrow}</p>
                    <h1 className="mt-3 font-bold text-4xl tracking-tight">{t.title}</h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-8">{t.description}</p>
                    <button className="mt-8 bg-primary px-4 rounded-lg h-10 w-fit font-medium text-primary-foreground text-sm hover:bg-primary/80" onClick={ reset } type="button">
                        {t.retry}
                    </button>
                </main>
            </body>
        </html>
    );
}
