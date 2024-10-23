/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */



import { Common, Renderer } from "@k8slens/extensions";
import React from "react";

type Pod = Renderer.K8sApi.Pod;

const {
  Component: {
    createTerminalTab,
    terminalStore,
    MenuItem,
    Icon,
    SubMenu,
    StatusBrick,
  },
  Navigation,
} = Renderer;
const {
  Util,
  App,
} = Common;

export class PodShellMenu extends React.Component<Renderer.Component.KubeObjectMenuProps<Pod>> {
  async execShell(container?: string) {
    const { object: pod } = this.props;

    // const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
    const smcEksCmd = "smc eks pod enter";
    // "10-192-35-1.cls-geb4wx4p.ecp.shopeemobile.com"
    const nodeName = pod.getNodeName();
    const commandParts = [
      smcEksCmd,
      "-k", nodeName.split(".")[1],
      "-n", pod.getNs(),
      pod.getName(),
    ];

    if (window.navigator.platform !== "Win32") {
      commandParts.unshift("exec");
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`,
    });

    terminalStore.sendCommand(commandParts.join(" "), {
      enter: true,
      tabId: shell.id,
    });

    Navigation.hideDetails();
  }

  render() {
    const { object, toolbar } = this.props;
    const containers = object.getRunningContainers();

    if (!containers.length) return null;

    return (
      <MenuItem onClick={Util.prevDefault(() => this.execShell(containers[0].name))}>
        <Icon
          svg="ssh"
          interactive={toolbar}
          tooltip={toolbar && "Pod Shell"}
        />
        <span className="title">Shell</span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right" />
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;

                  return (
                    <MenuItem
                      key={name}
                      onClick={Util.prevDefault(() => this.execShell(name))}
                      className="flex align-center"
                    >
                      <StatusBrick />
                      <span>{name}</span>
                    </MenuItem>
                  );
                })
              }
            </SubMenu>
          </>
        )}
      </MenuItem>
    );
  }
}
