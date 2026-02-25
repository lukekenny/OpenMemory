import { all_async } from "../../core/db";
import { sector_configs } from "../../memory/hsg";
import { getEmbeddingInfo } from "../../memory/embed";
import { tier, env } from "../../core/cfg";

const TIER_BENEFITS = {
    hybrid: {
        recall: 98,
        qps: "700-800",
        ram: "0.5gb/10k",
        use: "For high accuracy",
    },
    fast: {
        recall: 70,
        qps: "700-850",
        ram: "0.6GB/10k",
        use: "Local apps, extensions",
    },
    smart: {
        recall: 85,
        qps: "500-600",
        ram: "0.9GB/10k",
        use: "Production servers",
    },
    deep: {
        recall: 94,
        qps: "350-400",
        ram: "1.6GB/10k",
        use: "Cloud, high-accuracy",
    },
};

export function sys(app: any) {
    app.get(
        "/health",
        async (incoming_http_request: any, outgoing_http_response: any) => {
            outgoing_http_response.json({
                ok: true,
                version: "2.0-hsg-tiered",
                embedding: getEmbeddingInfo(),
                tier,
                dim: env.vec_dim,
                cache: env.cache_segments,
                expected: TIER_BENEFITS[tier],
            });
        },
    );

    /**
     * Build/runtime info endpoint.
     *
     * Purpose: make it easy to confirm which image/build is running without exec'ing into the container.
     *
     * These values are populated at build/deploy time via environment variables when available:
     * - OM_BUILD_SHA: git commit SHA
     * - OM_BUILD_REF: git ref/branch/tag
     * - OM_BUILD_TIME: ISO timestamp of build
     * - OM_IMAGE: image name/tag
     * - OM_VERSION: app version override (falls back to package.json if wired later)
     */
    app.get("/api/system/build", async (_req: any, res: any) => {
        res.json({
            ok: true,
            version: process.env.OM_VERSION || "openmemory-js",
            build: {
                sha: process.env.OM_BUILD_SHA || null,
                ref: process.env.OM_BUILD_REF || null,
                time: process.env.OM_BUILD_TIME || null,
                image: process.env.OM_IMAGE || null,
            },
            runtime: {
                node: process.version,
                pid: process.pid,
                uptime_s: Math.round(process.uptime()),
            },
        });
    });

    app.get(
        "/sectors",
        async (incoming_http_request: any, outgoing_http_response: any) => {
            try {
                const database_sector_statistics_rows = await all_async(`
                select primary_sector as sector, count(*) as count, avg(salience) as avg_salience
                from memories
                group by primary_sector
            `);
                outgoing_http_response.json({
                    sectors: Object.keys(sector_configs),
                    configs: sector_configs,
                    stats: database_sector_statistics_rows,
                });
            } catch (unexpected_error_fetching_sectors) {
                outgoing_http_response.status(500).json({ err: "internal" });
            }
        },
    );
}
