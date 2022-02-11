/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensLogger } from "../logger";
import allowErrorReportingInjectable, { AllowErrorReporting } from "../user-preferences/allow-error-reporting.injectable";
import { inspect } from "util";
import { init } from "@sentry/electron";
import { Dedupe, Offline } from "@sentry/integrations";
import isProductionInjectable from "../vars/is-production.injectable";
import errorReportingLoggerInjectable from "./logger.injectable";
import sentryDsnInjectable from "../vars/sentry-dsn.injectable";

function mapProcessName(processType: "browser" | "renderer" | "worker") {
  switch (processType) {
    case "browser":
      return "main";
    default:
      return "renderer";
  }
}
interface Dependencies {
  allowErrorReporting: AllowErrorReporting;
  sentryDsn: string;
  isProduction: boolean;
  logger: LensLogger;
}

const initSentry = ({
  allowErrorReporting,
  sentryDsn,
  isProduction,
  logger,
}: Dependencies) => (
  () => {
    if (!sentryDsn) {
      return logger.info("skipping sentry setup, no DSN suplied");
    }

    const processName = mapProcessName(process.type);

    init({
      beforeSend: (event) => {
        if (allowErrorReporting.value) {
          return event;
        }

        /**
       * Directly write to stdout so that no other integrations capture this and create an infinite loop
       */
        process.stdout.write(`🔒  [SENTRY-BEFORE-SEND-HOOK]: allowErrorReporting: ${allowErrorReporting}. Sentry event is caught but not sent to server.`);
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
        process.stdout.write(inspect(event, false, null, true));
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

        // if return null, the event won't be sent
        // ref https://github.com/getsentry/sentry-javascript/issues/2039
        return null;
      },
      dsn: sentryDsn,
      integrations: [
        new Dedupe(),
        new Offline(),
      ],
      initialScope: {
        tags: {
          "process": processName,
        },
      },
      environment: isProduction ? "production" : "development",
    });
  }
);

const initSentryInjectable = getInjectable({
  id: "init-sentry",
  instantiate: (di) => initSentry({
    allowErrorReporting: di.inject(allowErrorReportingInjectable),
    isProduction: di.inject(isProductionInjectable),
    logger: di.inject(errorReportingLoggerInjectable),
    sentryDsn: di.inject(sentryDsnInjectable),
  }),
});

export default initSentryInjectable;
