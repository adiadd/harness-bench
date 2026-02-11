import { createEnv } from "@t3-oss/env-nextjs";
import { env as sharedEnv } from "@workspace/env";

export const env = createEnv({
  extends: [sharedEnv],
  server: {},
  client: {},
  runtimeEnv: {},
});
