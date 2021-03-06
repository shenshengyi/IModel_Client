/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, XYAndZ } from "@bentley/geometry-core";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import {  BackstageManager, CommandItemDef, ConfigurableUiManager, FrontstageManager, SyncUiEventDispatcher, UiFramework } from "@bentley/ui-framework";
import { IncidentMarkerDemo } from "../api/IncidentClusterMarker";
import { TestDeSerializationView, TestShadow } from "./frontstages/Feature";
import { SampleFrontstage } from "./frontstages/SampleFrontstage";
import { SampleFrontstage2 } from "./frontstages/SampleFrontstage2";
import { View2D3DFrontstage } from "./frontstages/View2D3DFrontstage";

/**
 * Example Ui Configuration for an iModel.js App
 */
export class AppUi {

  // Initialize the ConfigurableUiManager
  public static initialize() {
    ConfigurableUiManager.initialize();
  }

  // Command that toggles the backstage
  public static get backstageToggleCommand(): CommandItemDef {
    return BackstageManager.getBackstageToggleCommand();
  }

  /** Handle when an iModel and the views have been selected  */
  public static handleIModelViewsSelected(iModelConnection: IModelConnection, viewStates: ViewState[]): void {
    // Set the iModelConnection in the Redux store
    UiFramework.setIModelConnection(iModelConnection);
    UiFramework.setDefaultViewState(viewStates[0]);

    // Tell the SyncUiEventDispatcher about the iModelConnection
    SyncUiEventDispatcher.initializeConnectionEvents(iModelConnection);

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider = new SampleFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FrontstageManager.setActiveFrontstageDef(frontstageProvider.frontstageDef).then(() => {
      // Frontstage is ready
      TestShadow();
    });

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider2 = new SampleFrontstage2(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider2);

    const view2D3D = new View2D3DFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(view2D3D);
  }

  public static images: HTMLImageElement[] = [];
  public static MarkStateList: MarkState[] = [];
  public static IncidentMarkerDemoList: IncidentMarkerDemo[] = [];
}


export interface MarkState
{
  location: Point3d;
  severity: number;
  id: number;
  iconIndex: number;
  text: string;
}