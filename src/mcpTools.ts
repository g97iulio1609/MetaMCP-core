import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";

export interface ToolDefinition<Name extends string = string> {
  name: Name;
  description?: string;
  inputSchema: z.ZodTypeAny;
  jsonSchema: Record<string, unknown>;
  outputSchema?: z.ZodTypeAny;
  outputJsonSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execution?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export interface ToolRegistry<Name extends string = string> {
  definitions: ToolDefinition<Name>[];
  handlers: Record<Name, ToolHandler>;
}

export const buildToolDefinitions = <TSchemaMap extends Record<string, z.ZodTypeAny>>(
  toolSchemas: TSchemaMap,
  toolDescriptions: Record<keyof TSchemaMap, string>,
): ToolDefinition<keyof TSchemaMap & string>[] =>
  (Object.keys(toolSchemas) as Array<keyof TSchemaMap>).map((name) => ({
    name: name as keyof TSchemaMap & string,
    description: toolDescriptions[name],
    inputSchema: toolSchemas[name],
    jsonSchema: zodToJsonSchema(
      toolSchemas[name] as unknown as Parameters<typeof zodToJsonSchema>[0],
      {
        name: String(name),
        $refStrategy: "none",
      },
    ) as Record<string, unknown>,
  }));

export const parseToolArgs = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  args: Record<string, unknown>,
) => schema.parse(args);
