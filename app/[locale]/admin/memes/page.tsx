import { MemeDataTable } from "@/app/admin/memes/meme-data-table";
import { memeRepository } from "@/data/MemeRepository";

export default async function AdminMemesPage() {
    const memes = await memeRepository.listForAdmin();

    return <MemeDataTable memes={ memes } />;
}
