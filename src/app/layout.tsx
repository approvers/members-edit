import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Approvers メンバー情報編集",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
