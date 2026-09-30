import { describe, expect, it } from "vitest";
import { generateVertexAdvisory, vertexConfigurationStatus } from "./vertex";

describe("Vertex AI adapter", () => {
  it("reports a server-only, configurable provider status", () => {
    const status = vertexConfigurationStatus();

    expect(status.provider).toBeTypeOf("string");
    expect(status.location).toBeTypeOf("string");
    expect(status.model).toBeTypeOf("string");
    expect(status.projectConfigured).toBeTypeOf("boolean");
    expect(status.configured).toBeTypeOf("boolean");
  });

  it("fails safely when the local project is not configured", async () => {
    if (vertexConfigurationStatus().projectConfigured) return;

    await expect(
      generateVertexAdvisory({
        prompt: "Return a safe test advisory.",
        schema: {
          type: "object",
          properties: { summary: { type: "string" } },
          required: ["summary"],
          additionalProperties: false,
        },
      }),
    ).rejects.toThrow("GOOGLE_CLOUD_PROJECT is not configured");
  });
});
