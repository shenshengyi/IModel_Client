import { Config, Logger } from "@bentley/bentleyjs-core";
import { AngleSweep, Arc3d, Point2d, Point3d, XAndY, XYAndZ } from "@bentley/geometry-core";
import { AxisAlignedBox3d, ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { BeButton, BeButtonEvent, Cluster, DecorateContext, EventHandled, GraphicType, imageElementFromUrl, IModelApp, Marker, MarkerImage, MarkerSet, MessageBoxIconType, MessageBoxType, PrimitiveTool, Tool, Viewport } from "@bentley/imodeljs-frontend";
import SVTRpcInterface from "../../common/SVTRpcInterface";
import { AppUi, MarkState } from "../app-ui/AppUi";

/** Example Marker to show an *incident*. Each incident has an *id*, a *severity*, and an *icon*. */
class IncidentMarker extends Marker {
  private static _size = Point2d.create(30, 30);
  private static _imageSize = Point2d.create(40, 40);
  private static _imageOffset = Point2d.create(0, 30);
  private static _amber = ColorDef.create(ColorByName.amber);
  private static _sweep360 = AngleSweep.create360();
  private _color: ColorDef;

  /** uncomment the next line to make the icon only show when the cursor is over an incident marker. */
  // public get wantImage() { return this._isHilited; }

  /** Get a color based on severity by interpolating Green(0) -> Amber(15) -> Red(30)  */
  public static makeColor(severity: number): ColorDef {
    return (severity <= 16 ? ColorDef.green.lerp(this._amber, (severity - 1) / 15.) :
      this._amber.lerp(ColorDef.red, (severity - 16) / 14.));
  }

  // when someone clicks on our marker, open a message box with the severity of the incident.
  public onMouseButton(ev: BeButtonEvent): boolean {
    if (ev.button === BeButton.Data && ev.isDown)
      IModelApp.notifications.openMessageBox(MessageBoxType.LargeOk, `severity = ${this.severity}`, MessageBoxIconType.Information); // eslint-disable-line @typescript-eslint/no-floating-promises
    return true;
  }
  public severity: number;
  public id: number;
  /** Create a new IncidentMarker */
  constructor(markdata: MarkState) {
    const point: Point3d = Point3d.fromJSON(markdata.location);
    super(point, IncidentMarker._size);
    this.severity = markdata.severity;
    this.id = markdata.id;
    this._color = IncidentMarker.makeColor(markdata.severity); // color interpolated from severity
    const icon = AppUi.images[markdata.iconIndex];
    this.setImage(icon); // save icon
    this.imageOffset = IncidentMarker._imageOffset; // move icon up by 30 pixels so the bottom of the flag is at the incident location in the view.
    this.imageSize = IncidentMarker._imageSize; // 40x40
    this.title = `Tag: ${markdata.text}`; // tooltip
    this.setScaleFactor({ low: .2, high: 1.4 }); // make size 20% at back of frustum and 140% at front of frustum (if camera is on)
    this.label = markdata.id.toString();
  }

  /**
   * For this demo, add a WorldDecoration that draws a circle with a radius of 200cm centered at the incident location.
   * WorldDecorations are in world coordinates, so the circle will change size as you zoom in/out. Also, they are drawn with the z-buffer enabled, so
   * the circle may be obscured by other geometry in front of in the view. This can help the user understand the point that the marker relates to,
   * but that effect isn't always desireable.
   *
   * World decorations for markers are completely optional. If you don't want anything drawn with WorldDecorations, don't follow this example.
   *
   */
  public addMarker(context: DecorateContext) {
    super.addMarker(context);
    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);
    const ellipse = Arc3d.createScaledXYColumns(this.worldLocation, context.viewport.rotation.transpose(), .2, .2, IncidentMarker._sweep360);
    // draw the circle the color of the marker, but with some transparency.
    let color = this._color;
    builder.setSymbology(ColorDef.white, color, 1);
    color = color.withTransparency(200);
    builder.addArc(ellipse, false, false);
    builder.setBlankingFill(color);
    builder.addArc(ellipse, true, true);
    context.addDecorationFromBuilder(builder);
  }
}

/** A Marker used to show a cluster of incidents */
class IncidentClusterMarker extends Marker {
  private _clusterColor: string;
  // public get wantImage() { return this._isHilited; }

  // draw the cluster as a white circle with an outline color based on what's in the cluster
  public drawFunc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = this._clusterColor;
    ctx.fillStyle = "white";
    ctx.lineWidth = 5;
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /** Create a new cluster marker with label and color based on the content of the cluster */
  constructor(location: XYAndZ, size: XAndY, cluster: Cluster<IncidentMarker>, image: Promise<MarkerImage>) {
    super(location, size);

    // get the top 10 incidents by severity
    const sorted: IncidentMarker[] = [];
    const maxLen = 10;
    cluster.markers.forEach((marker) => {
      if (maxLen > sorted.length || marker.severity > sorted[sorted.length - 1].severity) {
        const index = sorted.findIndex((val) => val.severity < marker.severity);
        if (index === -1)
          sorted.push(marker);
        else
          sorted.splice(index, 0, marker);
        if (sorted.length > maxLen)
          sorted.length = maxLen;
      }
    });

    this.imageOffset = new Point3d(0, 28);
    this.imageSize = new Point2d(30, 30);
    this.label = cluster.markers.length.toLocaleString();
    this.labelColor = "black";
    this.labelFont = "bold 14px sans-serif";

    let title = "";
    sorted.forEach((marker) => {
      if (title !== "")
        title += "<br>";
      title += `Severity: ${marker.severity} Id: ${marker.id}`;
    });
    if (cluster.markers.length > maxLen)
      title += "<br>...";

    const div = document.createElement("div"); // Use HTML as markup isn't supported for string.
    div.innerHTML = title;
    this.title = div;
    this._clusterColor = IncidentMarker.makeColor(sorted[0].severity).toHexString();
    this.setImage(image);
  }
}

/** A MarkerSet to hold incidents. This class supplies to `getClusterMarker` method to create IncidentClusterMarkers. */
class IncidentMarkerSet extends MarkerSet<IncidentMarker> {
  protected getClusterMarker(cluster: Cluster<IncidentMarker>): Marker {
    return IncidentClusterMarker.makeFrom(cluster.markers[0], cluster, IncidentMarkerDemo.decorator!.warningSign);
  }
}

/** This demo shows how to use MarkerSets to cluster markers that overlap on the screen. It creates a set of 500
 * "incidents" at random locations within the ProjectExtents. For each incident, it creates an IncidentMarker with an Id and
 * with a random value between 1-30 for "severity", and one of 5 possible icons.
 */
export class IncidentMarkerDemo {
  private _awaiting = false;
  private _loading?: Promise<any>;
  public readonly incidents = new IncidentMarkerSet();
  public static decorator?: IncidentMarkerDemo; 

  public get warningSign() { return AppUi.images[0]; }
  private async loadOne(src: string) {
    try {
      return await imageElementFromUrl(src); // note: "return await" is necessary inside try/catch
    } catch (err) {
      const msg = `Could not load image ${src}`;
      Logger.logError("IncidentDemo", msg);
      console.log(msg); // eslint-disable-line no-console
    }
    return undefined;
  }
    private async loadAll( d: MarkState) {

    this.incidents.markers.add(new IncidentMarker(d));
    this._loading = undefined;
  }

  public constructor( d:MarkState) {
    this.loadAll(d); // eslint-disable-line @typescript-eslint/no-floating-promises
  }
  public decorate(context: DecorateContext) {
    if (!context.viewport.view.isSpatialView())
      return;

    if (undefined === this._loading) {
      this.incidents.addDecoration(context);
      return;
    }
    if (!this._awaiting) {
      this._awaiting = true;
      this._loading.then(() => {
        context.viewport.invalidateCachedDecorations(this);
        this._awaiting = false;
      }).catch(() => undefined);
    }
  }

  private static async start(extents: AxisAlignedBox3d, point: Point3d) {
    console.log(extents);
    const markData: MarkState = {
        location: point,
        iconIndex: 0,
        severity: 10,
        id: 0,
        text:"信号灯放置位置不合适，请修正。",
    };
    const str = JSON.stringify(markData);
    const savedMarkFilePath = Config.App.get("imjs_mark_file");
    await SVTRpcInterface.getClient().writeExternalSavedViews(savedMarkFilePath,str);
    IncidentMarkerDemo.decorator = new IncidentMarkerDemo(markData);
    IModelApp.viewManager.addDecorator(IncidentMarkerDemo.decorator);
    IncidentMarkerDemo.decorator.incidents.viewport!.onChangeView.addOnce(() => this.stop());
  }

  private static stop() {
    if (IncidentMarkerDemo.decorator)
      IModelApp.viewManager.dropDecorator(IncidentMarkerDemo.decorator);
    IncidentMarkerDemo.decorator = undefined;
  }

  public  static async toggle(extents: AxisAlignedBox3d,point:Point3d) {
    if (undefined === IncidentMarkerDemo.decorator)
      {await this.start(extents,point);}
    else
      {this.stop();}
  }
}

export class IncidentMarkerDemoTool extends PrimitiveTool {
  public static toolId = "ToggleIncidentMarkers"; // <== Used to find flyover (tool name), description, and keyin from namespace tool registered with...see CoreTools.json for example...
  public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...
  constructor() {
    super();
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp && vp.view.isSpatialView()); }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; } // Allow snapping to terrain, etc. outside project extents.
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public onPostInstall() { super.onPostInstall(); this.setupAndPromptForNextAction(); }
  public onRestartTool(): void { this.exitTool(); }

  protected setupAndPromptForNextAction(): void {
    IModelApp.accuSnap.enableSnap(true);
  }

  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    if (undefined === ev.viewport)
      return EventHandled.No; // Shouldn't really happen
      const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp && vp.view.isSpatialView())
     await IncidentMarkerDemo.toggle(vp.view.iModel.projectExtents, ev.point);
    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
}