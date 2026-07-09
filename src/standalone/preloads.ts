import moment from "moment";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import { ApplicationRegistry } from "@mat3ra/standata";
import { ApplicationDriver } from "@mat3ra/standata/dist/js/ApplicationDriver";

// Bootstrap — must run before any component renders.
JSONSchemasInterface.setSchemas(esseSchemas as any);
ApplicationRegistry.setDriver(new ApplicationDriver());

(window as any).moment = moment;
