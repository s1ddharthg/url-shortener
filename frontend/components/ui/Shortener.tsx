"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ShortenerForm() {
    const [link, setLink] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const shorten = async () => {
        if (!link) return;

        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/shortener`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ link }),
                }
            );

            const data = await res.json();

            setShortUrl(
                `${process.env.NEXT_PUBLIC_API_URL}/${data.code}`
            );
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>URL Shortener</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <Input
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />

                <Button
                    onClick={shorten}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Generating..." : "Shorten URL"}
                </Button>

                {shortUrl && (
                    <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">
                            Short URL
                        </p>

                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 break-all"
                        >
                            {shortUrl}
                        </a>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}