/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { SelfSubjectRulesReviewApi } from "./self-subject-rules-review.api";

const selfSubjectRulesReviewApiInjectable = getInjectable({
  id: "self-subject-rules-review-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new SelfSubjectRulesReviewApi();
  },
});

export default selfSubjectRulesReviewApiInjectable;
