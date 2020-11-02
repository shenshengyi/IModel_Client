/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as fs from "fs-extra";
import * as process from "child_process";
import { IModelRpcProps, RpcManager } from "@bentley/imodeljs-common";
import ExportIFCInterface from "../common/ExportIFCInterface";
import { IModelHost } from "@bentley/imodeljs-backend";
import { createRequestContext } from "./webmain";
import { Briefcase, BriefcaseQuery } from "@bentley/imodelhub-client";

/** The backend implementation of SVTRpcImpl. */
export default class ExportImp extends ExportIFCInterface {
  public static register() {
      RpcManager.registerImpl(ExportIFCInterface, ExportImp);
  }

    public ExportIFCToFile(_token: IModelRpcProps, _ifc_version: string): Promise<void>{
        return  this.ExportIFC(_token,_ifc_version);
    }
    private async ExportIFC(token: IModelRpcProps, _ifc_version: string) {
        console.log(token);
        const imodelid = "e275057d-600e-4ab0-aaa8-5e656331db31";
        const req = createRequestContext();       
        const bs = await IModelHost.iModelClient.briefcases.get(req, imodelid, new BriefcaseQuery().selectDownloadUrl());
        console.log(bs.length);
        if (bs && bs.length > 0) {
            console.log(bs[0]);
            const newUrl = "file:///D:/iTwinAPP/iModelWeb/bank/root/imodelfs/bankfs/acd4f071-02d8-4c62-8af3-6b2c77b19a5c/e275057d-600e-4ab0-aaa8-5e656331db31/imodel-e275057d-600e-4ab0-aaa8-5e656331db31/e275057d-600e-4ab0-aaa8-5e656331db31-3e2d85a7fcdfaf743f10a386a7ca8ab670e7d9e9.bim";
            const newBriefcases: Briefcase = {...bs[0],downloadUrl:newUrl};
            const filepath = "D://iModelJS_TSG_GIT//IModel_Client//data//Rail.bim"
            await IModelHost.iModelClient.briefcases.download(req, newBriefcases, filepath);
            console.log("下载完成");
            await Run(filepath);
        }

    }
}

async function Run(bimPath: string) {
    if (fs.existsSync(bimPath)) {
        console.log(bimPath + "文件存在");
    } else {
        console.log(bimPath + "文件不存在");
        return;
    }
    const exec = process.execFile;
    // const exePath = "D://C++_Study//ExportIFC//x64//Release//ExportIFC.exe";
    const exePath = "D://IFC_Exporter//IFCExporter_00.00.01.01//Product//iModelToIFCConverter4X3//bin//x64//iModelToIFCConverter4X3.exe";
    if (fs.existsSync(exePath)) {
        console.log(exePath + "存在");
    } else {
        console.log(exePath + "不存在");
        return;
    }
    const target  = "D://iModelJS_TSG_GIT//IModel_Client//data//Rail.ifc"
    if (fs.existsSync(target)) {
        fs.removeSync(target);
    }
    const BimToIFCFunction = function () {
        exec(exePath, [bimPath, '-o', target], function (err: any, data: any) {  
        console.log(err)
        console.log(data.toString());                       
        });
    }

    BimToIFCFunction();
}


/** Auto-register the impl when this file is included. */

