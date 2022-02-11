/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import path from "path";
import hb from "handlebars";
import type { KubernetesCluster } from "../catalog/entity/declarations";
import yaml from "js-yaml";
import type { KubectlApplyAll } from "../ipc/kubectl/apply-all.token";
import type { KubectlDeleteAll } from "../ipc/kubectl/delete-all.token";
import type { ReadDir } from "../fs/read-dir.injectable";
import type { ReadFile } from "../fs/read-file.injectable";
import type { LensLogger } from "../logger";

export interface ResourceStackDependencies {
  kubectlApplyAll: KubectlApplyAll;
  kubectlDeleteAll: KubectlDeleteAll;
  readonly logger: LensLogger;
  readonly productName: string;
  readDir: ReadDir;
  readFile: ReadFile;
}

export interface ResourceApplingStack {
  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string>;
  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string>;
}

export class ResourceStack implements ResourceApplingStack {
  constructor(
    protected readonly dependencies: ResourceStackDependencies,
    protected readonly cluster: KubernetesCluster,
    protected readonly name: string,
  ) {}

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);

    return this.applyResources(resources, extraArgs);
  }

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);

    return this.deleteResources(resources, extraArgs);
  }

  protected async applyResources(resources: string[], extraArgs: string[] = []): Promise<string> {
    this.appendKubectlArgs(extraArgs);

    const response = await this.dependencies.kubectlApplyAll(this.cluster.getId(), resources, extraArgs);

    if (response.stderr) {
      throw new Error(response.stderr);
    }

    return response.stdout;
  }

  protected async deleteResources(resources: string[], extraArgs?: string[]): Promise<string> {
    this.appendKubectlArgs(extraArgs);

    const response = await this.dependencies.kubectlDeleteAll(this.cluster.getId(), resources, extraArgs);

    if (response.stderr) {
      throw new Error(response.stderr);
    }

    return response.stdout;
  }

  protected appendKubectlArgs(kubectlArgs: string[]) {
    if (!kubectlArgs.includes("-l") && !kubectlArgs.includes("--label")) {
      kubectlArgs.push("-l", `app.kubernetes.io/name=${this.name}`);
    }
  }

  protected async renderTemplates(folderPath: string, templateContext: any): Promise<string[]> {
    const resources: string[] = [];

    this.dependencies.logger.info(`rendering templates from ${folderPath}`);
    const entries = await this.dependencies.readDir(folderPath, { withFileTypes: true });

    for(const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const file = path.join(folderPath, entry.name);
      const raw = await this.dependencies.readFile(file, { encoding: "utf-8" });
      const data = (
        entry.name.endsWith(".hb")
          ? hb.compile(raw)(templateContext)
          : raw
      ).trim();

      if (!data) {
        continue;
      }

      for (const entry of yaml.loadAll(data)) {
        if (typeof entry !== "object" || !entry) {
          continue;
        }

        const resource = entry as Record<string, any>;

        if (typeof resource.metadata === "object") {
          resource.metadata.labels ??= {};
          resource.metadata.labels["app.kubernetes.io/name"] = this.name;
          resource.metadata.labels["app.kubernetes.io/managed-by"] = this.dependencies.productName;
          resource.metadata.labels["app.kubernetes.io/created-by"] = "resource-stack";
        }

        resources.push(yaml.dump(resource));
      }
    }

    return resources;
  }
}
