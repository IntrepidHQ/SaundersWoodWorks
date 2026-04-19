/**
 * Proxies Mapbox Geocoding so MAPBOX_API stays in Supabase secrets.
 * Set secret: supabase secrets set MAPBOX_API=pk.your_token
 * Deploy:    supabase functions deploy mapbox-geocode --project-ref YOUR_PROJECT_REF
 *
 * Supports GET (?q=…) and POST JSON { q, limit?, types?, country?, proximity? } for browser clients.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
};

type GeoParams = {
  q: string;
  limit: string;
  types: string;
  country: string | null;
  proximity: string | null;
};

function parseParams(req: Request, url: URL): Promise<GeoParams> {
  if (req.method === "POST") {
    return req.json().then((j: Record<string, unknown>) => ({
      q: String(j.q ?? "").trim(),
      limit: String(j.limit ?? "6"),
      types: String(j.types ?? "address,place,locality,postcode"),
      country: j.country != null && j.country !== ""
        ? String(j.country)
        : null,
      proximity: j.proximity != null && j.proximity !== ""
        ? String(j.proximity)
        : null,
    })).catch(() => ({
      q: "",
      limit: "6",
      types: "address,place,locality,postcode",
      country: null,
      proximity: null,
    }));
  }
  return Promise.resolve({
    q: (url.searchParams.get("q") || "").trim(),
    limit: url.searchParams.get("limit") || "6",
    types: url.searchParams.get("types") ||
      "address,place,locality,postcode",
    country: url.searchParams.get("country"),
    proximity: url.searchParams.get("proximity"),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const mapboxToken = Deno.env.get("MAPBOX_API");
  if (!mapboxToken?.trim()) {
    return new Response(
      JSON.stringify({
        error: "MAPBOX_API is not set",
        message:
          "Add the MAPBOX_API secret for Edge Functions (Dashboard → Edge Functions → Secrets).",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }

  const incomingUrl = new URL(req.url);
  const params = await parseParams(req, incomingUrl);
  const q = params.q;

  if (q.length < 3) {
    return new Response(JSON.stringify({ type: "FeatureCollection", features: [] }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const mapboxUrl = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`,
  );
  mapboxUrl.searchParams.set("access_token", mapboxToken.trim());
  mapboxUrl.searchParams.set("autocomplete", "true");
  mapboxUrl.searchParams.set("limit", params.limit || "6");
  mapboxUrl.searchParams.set("types", params.types || "address,place,locality,postcode");
  if (params.country) mapboxUrl.searchParams.set("country", params.country);
  if (params.proximity) mapboxUrl.searchParams.set("proximity", params.proximity);

  const res = await fetch(mapboxUrl.toString());
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
    },
  });
});
