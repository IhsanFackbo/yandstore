import { NextResponse } from "next/server";

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TEST_SECRET_KEY =
  "1x0000000000000000000000000000000AA";

type TurnstileResponse = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: unknown;
      order?: unknown;
    };

    if (typeof body.token !== "string" || !body.token.trim()) {
      return NextResponse.json(
        { success: false, message: "Token verifikasi tidak ditemukan." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.order) || body.order.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak valid." },
        { status: 400 },
      );
    }

    const secret =
      process.env.TURNSTILE_SECRET_KEY?.trim() ||
      TURNSTILE_TEST_SECRET_KEY;
    const ip = request.headers.get("cf-connecting-ip");
    const payload = new FormData();
    payload.append("secret", secret);
    payload.append("response", body.token);
    if (ip) payload.append("remoteip", ip);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    let verification: TurnstileResponse;
    try {
      const response = await fetch(VERIFY_URL, {
        method: "POST",
        body: payload,
        signal: controller.signal,
      });
      verification = (await response.json()) as TurnstileResponse;
    } finally {
      clearTimeout(timeout);
    }

    if (
      !verification.success ||
      (verification.action && verification.action !== "checkout")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Verifikasi keamanan gagal. Silakan coba kembali.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? "Layanan verifikasi terlalu lama merespons."
          : "Tidak dapat memproses verifikasi saat ini.",
      },
      { status: 500 },
    );
  }
}
