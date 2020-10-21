import { Vector3d } from "@bentley/geometry-core";
import { calculateSolarDirectionFromAngles, ColorByName, ColorDef, DisplayStyle3dSettings, ElementProps, LightSettings, LightSettingsProps, RenderMode, ThematicDisplay, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@bentley/imodeljs-common";
import { ElementState, GeometricModel3dState, IModelApp, ModelState, SpatialViewState, ViewState3d } from "@bentley/imodeljs-frontend";
import { CommandItemDef, ItemList, UiFramework } from "@bentley/ui-framework";
import { PropertiesRpcInterface, RobotWorldReadRpcInterface } from "../../../common/PropertiesRpcInterface";
import SVTRpcInterface from "../../../common/SVTRpcInterface";

export class TestFeature {
  public static CreateCommand(
    id: string,
    des: string,
    func: (args?: any) => any
  ): CommandItemDef {
    const testV1Def = new CommandItemDef({
      commandId: id,
      execute: func,
      iconSpec: "icon-developer",
      label: des,
      description: des,
      tooltip: des,
    });
    return testV1Def;
  }
  public static ItemLists = new ItemList([
    TestFeature.CreateCommand("TestLight", "测试背景色", TestLight),
    TestFeature.CreateCommand("TestShadow", "测试阴影", TestShadow),
TestFeature.CreateCommand("AdjuctShadowDirectrion", "测试光照方向", AdjuctShadowDirectrion),
  ]);
}

async function  TestLight() {
  const vp = IModelApp.viewManager.selectedView!;
  if (vp.view.isSpatialView()) {
  const imodel = UiFramework.getIModelConnection()!;


    const eles = await imodel.elements.queryProps({ from: ElementState.classFullName });
    const es: ElementProps[] = [];
    for (const e of eles) {
      if (e.userLabel === "信号机-测试5") {
        es.push(e);
      }
    }
    const ids: string[] = [];
    ids.push("0x385");
    ids.push("0x380");
    ids.push("0x498");
    vp.changeModelDisplay(ids,true);
    const v3: SpatialViewState = vp.view as SpatialViewState;
    if (v3) {
      console.log(v3.modelSelector.models);
      let vf = vp.viewFlags.clone();
      vf.renderMode = RenderMode.SmoothShade;
      vp.viewFlags = vf;
}

  } else {
    alert("2d");
  }

}
async function TestShadow() {
  const vp = IModelApp.viewManager.selectedView!;
  let vf = vp.viewFlags.clone();
  vf.shadows = !vf.shadows;
  vp.viewFlags = vf;


}
async function AdjuctShadowDirectrion() {
//     const vp = IModelApp.viewManager.selectedView!;
//   const light = vp.lightSettings!;
//   const dir = new Vector3d(-0.9833878378071199, -0.18098510351728977, 0.013883542698953828);
//   let mylight: LightSettingsProps = {
//     ...light,
//     solar: { ...light.solar, direction: dir ,intensity:0},
//     hemisphere: { lowerColor: { r: 83, g: 100, b: 87 } },
//     portrait: { intensity: 0 },
//     specularIntensity: 0,
//   };

//   vp.setLightSettings(LightSettings.fromJSON(mylight));
//   console.log(mylight);
     const id = "0x2000000004d";
    const token = IModelApp.viewManager.selectedView?.view.iModel.getRpcProps();

  if (token) {
         const r =  await PropertiesRpcInterface.getClient().getElementProperties(
      token,
      id,
      true,
      false
        );
    console.log(r);
  }
// }
  // const esvString = await SVTRpcInterface.getClient().readExternalSavedViews("huren");
  // alert(esvString);
}
