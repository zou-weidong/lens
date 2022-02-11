/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../../package.json";

const productNameInjectable = getInjectable({
  id: "product-name",
  instantiate: () => packageJson.productName,
});

export default productNameInjectable;
