"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { useRef } from "react";

interface Props {
    username: string;
    profileUrl: string;
    displayName: string;
}

export function PlayerQrCard({ username, profileUrl, displayName }: Props) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const svg = cardRef.current?.querySelector("svg");
        if (!svg) return;

        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.download = `${username}-qr.png`;
            a.href = url;
            a.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(data)}`;
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <QrCode className="h-4 w-4" /> Mi QR Card
            </h2>
            <div ref={cardRef} className="flex flex-col items-center gap-3">
                <div className="rounded-xl bg-white p-3">
                    <QRCodeSVG
                        value={profileUrl}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#0a0a0a"
                        level="M"
                    />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
            </div>
            <button
                onClick={handleDownload}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
                <Download className="h-4 w-4" /> Descargar QR
            </button>
        </div>
    );
}
