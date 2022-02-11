/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-details-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PersistentVolume } from "../../../common/k8s-api/endpoints";
import { boundMethod } from "../../../common/utils";
import { TableRow } from "../table/table-row";
import { cssNames, prevDefault } from "../../utils";
import { TableCell } from "../table/table-cell";
import { Spinner } from "../spinner/spinner";
import { DrawerTitle } from "../drawer/drawer-title";
import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import type { PersistentVolumeStore } from "./store";
import kebabCase from "lodash/kebabCase";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import persistentVolumeStoreInjectable from "./store.injectable";

export interface VolumeDetailsListProps {
  persistentVolumes: PersistentVolume[];
}

enum sortBy {
  name = "name",
  status = "status",
  capacity = "capacity",
}

interface Dependencies {
  showDetails: ShowDetails;
  persistentVolumeStore: PersistentVolumeStore;
}

@observer
class NonInjectedVolumeDetailsList extends React.Component<VolumeDetailsListProps & Dependencies> {
  @boundMethod
  getTableRow(uid: string) {
    const { persistentVolumes, showDetails } = this.props;
    const volume = persistentVolumes.find(volume => volume.getId() === uid);

    return (
      <TableRow
        key={volume.getId()}
        sortItem={volume}
        nowrap
        onClick={prevDefault(() => showDetails(volume, { resetSelected: false }))}
      >
        <TableCell className="name">{volume.getName()}</TableCell>
        <TableCell className="capacity">{volume.getCapacity()}</TableCell>
        <TableCell className={cssNames("status", kebabCase(volume.getStatus()))}>{volume.getStatus()}</TableCell>
      </TableRow>
    );
  }

  render() {
    const { persistentVolumes, persistentVolumeStore } = this.props;
    const virtual = persistentVolumes.length > 100;

    if (!persistentVolumes.length) {
      return !persistentVolumeStore.isLoaded && <Spinner center/>;
    }

    return (
      <div className="VolumeDetailsList flex column">
        <DrawerTitle title="Persistent Volumes"/>
        <Table
          tableId="storage_volume_details_list"
          items={persistentVolumes}
          selectable
          virtual={virtual}
          sortable={{
            [sortBy.name]: (volume) => volume.getName(),
            [sortBy.capacity]: (volume) => volume.getCapacity(),
            [sortBy.status]: (volume) => volume.getStatus(),
          }}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "desc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="capacity" sortBy={sortBy.capacity}>Capacity</TableCell>
            <TableCell className="status" sortBy={sortBy.status}>Status</TableCell>
          </TableHead>
          {
            !virtual && persistentVolumes.map(volume => this.getTableRow(volume.getId()))
          }
        </Table>
      </div>
    );
  }
}

export const VolumeDetailsList = withInjectables<Dependencies, VolumeDetailsListProps>(NonInjectedVolumeDetailsList, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
  }),
});
