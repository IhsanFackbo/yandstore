import Storefront from "./storefront";

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export default function Home() {
  const siteKey =
    process.env.TURNSTILE_SITE_KEY?.trim() || TURNSTILE_TEST_SITE_KEY;

  return (
    <Storefront
      siteKey={siteKey}
      isTurnstileTestMode={!process.env.TURNSTILE_SITE_KEY?.trim()}
    />
  );
}
