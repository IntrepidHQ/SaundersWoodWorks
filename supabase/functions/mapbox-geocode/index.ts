/**
 * Proxies Mapbox Geocoding (forward) so MAPBOX_API stays in Supabase secrets.
 * Secret name: MAPBOX_API (Dashboard → Project Settings → Edge Functions → Secrets,
 * or: supabase secrets set MAPBOX_API=pk....)
 *
 * Query: ?q=...&limit=6&types=address&country=US&proximity=-79.93,32.77
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
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
        message: "Add the MAPBOX_API secret to this project (Edge Function secrets).",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }

  const incoming = new URL(req.url);
  const q = (incoming.searchParams.get("q") || "").trim();
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
  mapboxUrl.searchParams.set(
    "limit",
    incoming.searchParams.get("limit") || "6",
  );
  mapboxUrl.searchParams.set(
    "types",
    incoming.searchParams.get("types") || "address",
  );
  const country = incoming.searchParams.get("country");
  if (country) mapboxUrl.searchParams.set("country", country);
  const proximity = incoming.searchParams.get("proximity");
  if (proximity) mapboxUrl.searchParams.set("proximity", proximity);

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
