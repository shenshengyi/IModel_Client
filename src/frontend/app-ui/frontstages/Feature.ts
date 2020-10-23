import { Config, Guid, Id64String } from "@bentley/bentleyjs-core";
import { Angle, AngleSweep, Arc3d, CurveFactory, IndexedPolyface, LineSegment3d, LineString3d, Loop, LowAndHighXYZ, Point3d, Range1d, Range3d, Ray3d, Vector3d, WritableXYAndZ, YawPitchRollAngles } from "@bentley/geometry-core";
import { MarkedHalfEdgeSt } from "@bentley/geometry-core/lib/topology/HalfEdgeMarkSet";
import { calculateSolarDirectionFromAngles, Code, CodeProps, ColorByName, ColorDef, DisplayStyle3dSettings, ElementProps, GeometricElement3dProps, GeometryStreamBuilder, GeometryStreamProps, LightSettings, LightSettingsProps, RenderMode, RgbColor, SubCategoryAppearance, ThematicDisplay, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, BeButtonEvent, BeWheelEvent, ElementEditor3d, ElementState, EventHandled, GeometricModel3dState, HitDetail, IModelApp, IModelConnection, LocateFilterStatus, LocateResponse, ModelState, PrimitiveTool, SpatialViewState, StandardViewId, ViewState3d } from "@bentley/imodeljs-frontend";
import { CommandItemDef, ItemList, SavedView, SavedViewProps, UiFramework } from "@bentley/ui-framework";
import ExportIFCInterface from "../../../common/ExportIFCInterface";
import { PropertiesRpcInterface, RobotWorldReadRpcInterface } from "../../../common/PropertiesRpcInterface";
import SVTRpcInterface from "../../../common/SVTRpcInterface";
import { ViewCreator3d } from "../../api/ViewCreater3d";

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
    TestFeature.CreateCommand("TestSmoothShade", "平滑填充", TestSmoothShade),
    TestFeature.CreateCommand("TestDeSerializationView", "切换到保存视图", TestDeSerializationView),
    TestFeature.CreateCommand("RunSelectSignalTool", "运行盲区检测命令", RunSelectSignalTool),
    TestFeature.CreateCommand("TestShadow", "测试阴影", TestShadow),
    TestFeature.CreateCommand("AdjuctShadowDirectrion", "测试光照方向", AdjuctShadowDirectrion),
    TestFeature.CreateCommand("TestSerializationView", "保存当前视图至外部文件", TestSerializationView),
     TestFeature.CreateCommand("ExportIFC", "导出IFC", ExportIFC)
  ]);
}
async function TestSerializationView() {
  const vp = IModelApp.viewManager.selectedView!.view;
  const viewProp = SavedView.viewStateToProps(vp);
  const strViewProp = JSON.stringify(viewProp);
  const savedViewFilePath = Config.App.get("imjs_savedview_file");
  await SVTRpcInterface.getClient().writeExternalSavedViews(savedViewFilePath,strViewProp);
}
async function TestDeSerializationView() {
  const savedViewFilePath = Config.App.get("imjs_savedview_file");
  const strViewProp = await SVTRpcInterface.getClient().readExternalSavedViews(savedViewFilePath);
  const vp = IModelApp.viewManager.selectedView!;
  const viewProp: SavedViewProps = JSON.parse(strViewProp);
  const imodel = UiFramework.getIModelConnection()!;
  const viewState = await SavedView.viewStateFromProps(imodel, viewProp);
  if (viewState) {
    vp.changeView(viewState);
 }
}
async function  TestSmoothShade() {
  const vp = IModelApp.viewManager.selectedView!;
  let vf = vp.viewFlags.clone();
  vf.renderMode = RenderMode.SmoothShade;
  vf.acsTriad = !vf.acsTriad;
  vf.shadows = !vf.shadows;
  vf.fill = !vf.fill;
  vp.viewFlags = vf;

  
//   if (vp.view.isSpatialView()) {
//   const imodel = UiFramework.getIModelConnection()!;


//     const eles = await imodel.elements.queryProps({ from: ElementState.classFullName });
//     const es: ElementProps[] = [];
//     for (const e of eles) {
//       if (e.userLabel === "信号机-测试5") {
//         es.push(e);
//       }
//     }
//     const ids: string[] = [];
//     ids.push("0x385");
//     ids.push("0x380");
//     ids.push("0x498");
//     vp.changeModelDisplay(ids,true);
//     const v3: SpatialViewState = vp.view as SpatialViewState;
//     if (v3) {
//       console.log(v3.modelSelector.models);
//       let vf = vp.viewFlags.clone();
//       vf.renderMode = RenderMode.SmoothShade;
//       vp.viewFlags = vf;
// }

//   } else {
//     alert("2d");
//   }

}
async function TestShadow() {
  const vp = IModelApp.viewManager.selectedView!;
  let vf = vp.viewFlags.clone();
  vf.shadows = !vf.shadows;
  vp.viewFlags = vf;



}
async function RunSelectSignalTool() {
  IModelApp.tools.run(SelectSignalTool.toolId); 
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

// }
  // const esvString = await SVTRpcInterface.getClient().readExternalSavedViews("huren");
  // alert(esvString);
}
export class SelectSignalTool extends PrimitiveTool {
  public static toolId = "SelectSignalTool";
  public readonly points: Point3d[] = [];

  public requireWriteableTarget(): boolean {
    return false;
  }
  public onPostInstall() {
    super.onPostInstall();
    this.setupAndPromptForNextAction();
  }
  public setupAndPromptForNextAction(): void {
    IModelApp.notifications.outputPromptByKey(
      "SelectSignalTool run"
    );
  }
  public async filterHit(
    _hit: HitDetail,
    _out?: LocateResponse
  ): Promise<LocateFilterStatus> {
    return LocateFilterStatus.Accept;
  }
  async getToolTip(_hit: HitDetail): Promise<HTMLElement | string> {
    return "hello,NBA2020";
  }
  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.No;
  }
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    await IModelApp.locateManager.doLocate(
      new LocateResponse(),
      true,
      ev.point,
      ev.viewport,
      ev.inputSource
    );
    const hit = IModelApp.locateManager.currHit;
    this.points.push(ev.point);
    if (hit !== undefined) {
    const props = await this.iModel.elements.getProps(hit.sourceId);
      if (props && props.length > 0) {
        //this.points.push(ev.point);
        //alert(hit.sourceId);
       // this.QuerySignal(hit.sourceId);
      // if (this.points.length === 0) {
      //   this.QuerySignal(hit.sourceId);
      // } else {
      //   this.points.push(ev.point);
      // }
      }
    } 
    return EventHandled.No;
  }
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    IModelApp.toolAdmin.startDefaultTool();
    this.createMesh();
    return EventHandled.No;
  }
  private async CreateArc(center:Point3d) {
    const arc: Arc3d = Arc3d.create(center, new Vector3d(3, 3, 0), new Vector3d(-500, 500, 0));
    return arc;
  }
  private Cal2Point3dDistance(p1:Point3d,p2:Point3d) {
    const dis = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z);
    return Math.sqrt(dis);
  }
  private async createMesh() {
    if (this.points.length === 0) {
      alert("点的个数为0");
      return;
    }
    //信号灯id=0x2000000004d;
    const lightId = "0x2000000004d";
    const lightRange = await this.QueryElementRange3d(lightId);
    const pillarId = "0x2000000004b";
    const pillarRange = await this.QueryElementRange3d(pillarId);
    if (!lightRange || !pillarRange) {
      alert("灯或者柱子的范围不合法");
      return;
    }
    
    const pillarRangeMaxDistance = this.CalRangeMaxDistance(pillarRange.ranger);

    const lightOrigin = lightRange.origin;
    const pillarOrigin = pillarRange.origin;
    const dis = this.Cal2Point3dDistance(lightOrigin, pillarOrigin);
    console.log(dis);
    const sin = pillarRangeMaxDistance / dis;
    const angle = Math.asin(sin);
  
    const v = new Vector3d(pillarOrigin.x - lightOrigin.x, pillarOrigin.y - lightOrigin.y);
    const v1 = v.rotateXY(Angle.createRadians(angle));
    const v2 = v.rotateXY(Angle.createRadians(-angle));

    const r3d1 = Ray3d.create(lightOrigin, v1);
    const r3d2 = Ray3d.create(lightOrigin, v2);
    const p1 = r3d1.projectPointToRay(pillarOrigin);
    const p2 = r3d2.projectPointToRay(pillarOrigin);

    const seg1 = LineSegment3d.create(lightOrigin, p1);
    const seg2 = LineSegment3d.create(lightOrigin, p2);

    const p3 = seg1.fractionToPoint(2);
    const p4 = seg2.fractionToPoint(2);
    const seg3 = LineSegment3d.create(lightOrigin, p3);
    const seg4 = LineSegment3d.create(lightOrigin, p4);

    const p = this.points[0];
    const vn = new Vector3d(p.x - lightOrigin.x, p.y - lightOrigin.y);
    const cn = new Vector3d(vn.y, -vn.x);
   const newArd = CurveFactory.createArcPointTangentPoint(lightOrigin, cn, p);
    const loop2 = Loop.createArray([newArd!]);

    //////////////////////////////////////////////////
    const lightAngle = Math.PI / 6;
    const targetPoint = this.points[0];
    //中轴向量
    const axisVec = new Vector3d(targetPoint.x - lightOrigin.x, targetPoint.y - lightOrigin.y,targetPoint.z - lightOrigin.z);
   //光线的边界向量
    const leftVec = axisVec.rotateXY(Angle.createRadians(lightAngle));
    const rightVec = axisVec.rotateXY(Angle.createRadians(-lightAngle));
    //光线的边界射线
    const leftRay3d = Ray3d.create(lightOrigin, leftVec);
    const rightRay3d = Ray3d.create(lightOrigin, rightVec);

    //目标点在边界射线投影
    const leftProjectPoint = leftRay3d.projectPointToRay(targetPoint);
    const rightProjectPoitn = rightRay3d.projectPointToRay(targetPoint);

    const s1 = LineSegment3d.create(lightOrigin, leftProjectPoint);
    const s2 = LineSegment3d.create(lightOrigin, targetPoint);
    const s3 = LineSegment3d.create(lightOrigin, rightProjectPoitn);
    const arc = Arc3d.createCircularStartMiddleEnd(leftProjectPoint, targetPoint, rightProjectPoitn);
    const lightLoop = Loop.createArray([s1,arc!,s3]);
    /////////////////////////////////////////////////
    const lightGeometryStreamBuilder = new GeometryStreamBuilder();
    //  geometryStreamBuilder.appendGeometry(s1);
    // geometryStreamBuilder.appendGeometry(s2);
    // geometryStreamBuilder.appendGeometry(s3);
   // geometryStreamBuilder.appendGeometry(arc!);
    lightGeometryStreamBuilder.appendGeometry(lightLoop);
    const obstacleGeometryStreamBuilder = new GeometryStreamBuilder();
    obstacleGeometryStreamBuilder.appendGeometry(seg3);
    obstacleGeometryStreamBuilder.appendGeometry(seg4);
    // geometryStreamBuilder.appendGeometry(loop);
    // geometryStreamBuilder.appendGeometry(loop2);
    // geometryStreamBuilder()

    // for (const p of this.points) {
    // const ray: Ray3d = Ray3d.createStartEnd(lightOrigin, p);
    // const seg: LineSegment3d = LineSegment3d.create(lightOrigin, p);
    // const r1d: Range1d = ray.intersectionWithRange3d(range);
    // if (r1d.isNull) {
    //   //alert("没有相交");
    // } else {
    //  // alert("相交");
    //   console.log(r1d);
    //   }
    //   // geometryStreamBuilder.appendGeometry(seg);
    // }

    // const loop = Loop.createPolygon([lightOrigin, ...this.points]);
    // geometryStreamBuilder.appendGeometry(loop);
    const lightGeom: GeomtryData = {
      geom: lightGeometryStreamBuilder.geometryStream,
      categoryAppearance:{ color: ColorDef.blue.tbgr }
    };
    const obstacleGeom: GeomtryData = {
      geom: obstacleGeometryStreamBuilder.geometryStream,
      categoryAppearance: { color: ColorDef.red.tbgr }
    };
    await ElementEdit([lightGeom,obstacleGeom]);
  }
  public onRestartTool(): void {
    const tool = new SelectSignalTool();
    if (!tool.run()) this.exitTool();
  }
  private CalRangeMaxDistance(range: Range3d): number{
    const maxDistance = Math.max(range.low.x, range.low.y, range.high.x, range.high.y);
    return maxDistance;
  }
  private async QueryElementRange3d(id: string) {
    const imodel = UiFramework.getIModelConnection()!;
    const elementprops = await imodel.elements.getProps(id);
    if (elementprops && elementprops.length > 0) {
      const eleProps = elementprops[0];
      const geom: GeometricElement3dProps = eleProps as GeometricElement3dProps;
      if (geom && geom.placement) {
        const place = geom.placement;
        if (place.bbox) {
          const box: Readonly<LowAndHighXYZ> = place.bbox;
          const ranger = Range3d.fromJSON(box);
          const origin = Point3d.fromJSON(place.origin);
          return {ranger,origin};
        }
      }
    }
    return null;
  }
  private async QuerySignal(id: string) {
    const imodel = UiFramework.getIModelConnection()!;
    const elementprops = await imodel.elements.getProps(id);
    if (elementprops && elementprops.length > 0) {
      const eleProps = elementprops[0];
      const geom: GeometricElement3dProps = eleProps as GeometricElement3dProps;
      if (geom && geom.placement) {
        const place = geom.placement;
        if (place.bbox) {
          const box: Readonly<LowAndHighXYZ> = place.bbox;
          console.log(box);
          let ranger = Range3d.fromJSON(box);
        
          console.log(ranger);
          console.log(place.origin); 
          const origin = Point3d.fromJSON(place.origin);
          const MaxX = Math.max(ranger.low.x, ranger.low.y, ranger.high.x, ranger.high.y);
          this.points.push(origin);

          console.log("最大范围:"+MaxX.toString());
          // const p = Point3d.fromJSON(place.origin);
          // this.points.push(p);
          // console.log(p);
          // const p: Point3d = ranger.center;
          // // p.scaleInPlace(10000);
          // // this.points.push(p);
          // console.log(ranger);
          //console.log(place.origin);
        }
      }
    }
  }
}

interface GeomtryData
{
  geom: GeometryStreamProps;
  categoryAppearance: SubCategoryAppearance.Props;
}

async function CreateGeometry(
  iModel:IModelConnection,
  editor: ElementEditor3d,
  model: Id64String,
  geoms:GeomtryData[]
): Promise<void> {

  const dictionaryModelId = await iModel.models.getDictionaryModel();
  for (const g of geoms) {
    const category = await iModel.editing.categories.createAndInsertSpatialCategory(
    dictionaryModelId,
    Guid.createValue(),
    g.categoryAppearance
    );
    const cr = Code.createEmpty();
    const code = new Code({
    ...cr,
      value: Guid.createValue(),
    });
    const props3d: GeometricElement3dProps = {
    classFullName: "Generic:PhysicalObject",
    model,
    category,
    code,
    geom: g.geom,
    userLabel: "taiyang1",
    // placement: {
    //   origin: Point3d.createZero(),
    //   angles: YawPitchRollAngles.createDegrees(0, 0, 0),
    //   bbox: Range3d.fromJSON(),
    // },
    };
   await editor.createElement(props3d);
  } 
}

async function ElementEdit(g:GeomtryData[]) {
  const iModel = UiFramework.getIModelConnection()!;
  const editor = await ElementEditor3d.start(iModel);
  const modelCode = await iModel.editing.codes.makeModelCode(
    iModel.models.repositoryModelId,
    Guid.createValue()
  );
  const model = await iModel.editing.models.createAndInsertPhysicalModel(
    modelCode
  );
  await CreateGeometry(iModel,editor, model,g);
 // const r = new Range3d(0, 0, 0, 5, 5, 5);
  await editor.write();
  //await iModel.editing.updateProjectExtents(r);
  await editor.end();
  await iModel.saveChanges("create element test"); // TODO: Move this after select statement when we fix the problem with querying uncommitted changes
 // await iModel.editing.concurrencyControl.pullMergePush("create element test - model and category");
  try {
    await iModel.models.load(model);
  } catch (e) {
    alert(e);
  }
  const viewCreator3d: ViewCreator3d = new ViewCreator3d(iModel);
  let view3d = await viewCreator3d.createDefaultView(
    {
      cameraOn: true,
      skyboxOn: true,
      useSeedView: true,
      standardViewId: StandardViewId.Front,
    },
    [model]
  );
  const vp = IModelApp.viewManager.selectedView!;
  if (!vp.view.isSpatialView) {
    return;
  }
  const view = vp.view as SpatialViewState;
  const proIds = view.modelSelector.models;

  IModelApp.viewManager.selectedView!.changeView(view3d);
  const vp2 = IModelApp.viewManager.selectedView!;
  vp2.addViewedModels(proIds);
}

async function  ExportIFC() {
  
  const token = UiFramework.getIModelConnection()!.getRpcProps();
  if (!token) {
    alert("toeken无效请检查");
    return;
  }
  //  const imodelId = Config.App.get("imjs_test_imodel_id");
  //  //const contextId = Config.App.get("imjs_test_context_id");
    const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();
  // //const hubmodel = await IModelApp.iModelClient.iModel.get(requestContext, contextId);
  // const hu = await IModelApp.iModelClient.briefcases.get(requestContext, imodelId);
  // if (hu) {
  //   alert(hu[0].fileName);
  // }
  //  const workDir = __dirname + "/../../lib/output/";
  //  await IModelApp.iModelClient.briefcases.download(requestContext, imodelId,workDir);
  console.log(requestContext);
   await ExportIFCInterface.getClient().ExportIFCToFile(token, "4x3");
}