import { LinePixels, ColorDef } from "@bentley/imodeljs-common";
import {
  IModelApp,
  ViewTool,
  EventHandled,
  GraphicType,
  DecorateContext,
  BeButtonEvent,
} from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";

export class DrawLineTool extends ViewTool {
  public static toolId = "ITwinWebApp.DrawLineTool";
  private _points: Point3d[] = [];

  decorate(context: DecorateContext) {
    if (
      this.viewport === undefined ||
      !this.viewport.view.is3d() ||
      this.viewport.view.iModel !== context.viewport.view.iModel
    ) {
      return;
    }

    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);

    const color = context.viewport.getContrastToBackgroundColor();

    builder.setSymbology(ColorDef.red, ColorDef.red, 10);

    builder.addPointString(this._points);

    builder.setSymbology(color, color, 4, LinePixels.Solid);

    builder.addLineString(this._points);

    context.addDecorationFromBuilder(builder);
  }

  async onDataButtonDown(ev: BeButtonEvent) {
    if (ev.viewport === undefined) {
      return EventHandled.No;
    } else if (this.viewport === undefined) {
      this.viewport = ev.viewport;
    } else if (this.viewport.view.iModel !== ev.viewport.view.iModel) {
      this.viewport = ev.viewport;
    }

    this._points.push(ev.point.clone());

    IModelApp.viewManager.invalidateDecorationsAllViews();

    return EventHandled.No;
  }
}
