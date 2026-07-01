import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
JSONSchemasInterface.setSchemas(esseSchemas as any);
