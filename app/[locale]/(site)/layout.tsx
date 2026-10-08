import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col bg-background min-h-svh text-foreground">
            <SiteHeader />
            <main className="flex flex-col flex-1">{children}</main>
        </div>
    );
}
