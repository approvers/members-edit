import { IndexClient } from "./client";

export default function Index() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-bold">Approvers メンバー情報編集</h1>
            <IndexClient />
        </main>
    );
}
