class Indoor {
    constructor(pTile, pScene) {
        this.m_pTile = null;
        this.m_pScene = null;
        this.m_nBuildingType = 0;
        this.m_pBuilding = null;
        this.m_pScreenPos = null;
        this.m_pTile = pTile;
        this.m_pScene = pScene;
        this.m_pBuilding = pScene.m_pScene.binding;
    }
    get screenPoint() {
        if (this.m_pBuilding) {
            let pBuildingObj = this.m_pBuilding.object3D;
            if (pBuildingObj) {
                let pPosition = pBuildingObj.transform.regionPosition;
                let pPoint = MiaokitJS.Miaokit.WorldToScreenPoint(pPosition);
                return pPoint;
            }
        }
        return null;
    }
}
class Main {
    constructor() {
        this.iii = 0;
        this.m_pApp = null;
        this.m_pGis = null;
        this.m_aDioramas = null;
        this.m_aTile = null;
        this.m_nLoading = 0;
        this.m_nTaskMax = 0;
        this.m_pCity = null;
        this.m_pIndoor = null;
        this.m_pStartMovie = null;
        let pThis = this;
        pThis.m_pApp = MiaokitJS.App;
        pThis.m_pApp.m_pProject = this;
    }
    Preload() {
        let pThis = this;
        pThis.m_aDioramas = MiaokitJS.m_pConfig.DIORS;
        pThis.m_aTile = MiaokitJS.m_pConfig.SVE;
        pThis.m_nLoading = pThis.m_aTile ? pThis.m_aTile.length : 0;
    }
    Start() {
        let pThis = this;
        if (!pThis.m_pCity) {
            pThis.m_pCity = {
                m_pName: "桂林",
                m_nLng: 110.258422,
                m_nLat: 25.266594
            };
        }
        pThis.m_pGis = pThis.m_pApp.m_pGis;
        pThis.m_pApp.m_pCameraCtrl.Jump(MiaokitJS.UTIL.CTRL_MODE.PANORAMA, {
            m_nLng: pThis.m_pCity.m_nLng,
            m_nLat: pThis.m_pCity.m_nLat,
            m_mTarget: { x: 0.0, y: 170.0, z: 0.0 },
            m_nDistance: 500.000,
            m_nPitch: 30.0,
            m_nYaw: 0.0
        });
        MiaokitJS.ShaderLab.SetSunlight(0.0, 90.0, 0.1);
    }
    Update() {
        if ((this.iii++) % 180 === 0) {
            console.log(this.m_pApp.m_pCameraCtrl);
        }
        let pState = undefined;
        if (this.m_pGis) {
            this.m_pGis.Update(this.m_pApp.m_pCameraCtrl.lng, this.m_pApp.m_pCameraCtrl.lat, pState ? pState.m_pGisDistance : this.m_pApp.m_pCameraCtrl.height);
        }
        if (this.m_aDioramas) {
            for (let pDior of this.m_aDioramas) {
                pDior.m_pDior.Update();
            }
        }
        let nTaskCount = MiaokitJS.Miaokit.progress;
        if (0 === nTaskCount) {
            let pCanvas = MiaokitJS.App.m_pCanvas2D;
            let nCenter = { x: 0.5 * pCanvas.width, y: 0.5 * pCanvas.height };
            let pNearest = null;
            let nDistance = 1000.0;
            for (let pTile of this.m_aTile) {
                for (let pIndoor of pTile.m_aIndoor) {
                    let pPoint = pIndoor.screenPoint;
                    pPoint.x = pPoint.x * pCanvas.width;
                    pPoint.y = pPoint.y * pCanvas.height;
                    let x = pPoint.x - nCenter.x;
                    x *= x;
                    let y = pPoint.y - nCenter.y;
                    y *= y;
                    let nDistance_ = Math.sqrt(x + y);
                    if (nDistance > nDistance_) {
                        nDistance = nDistance_;
                        pNearest = pIndoor;
                    }
                }
            }
            if (pNearest && pNearest !== this.m_pIndoor) {
                if (this.m_pIndoor) {
                    if (this.m_pIndoor.m_pBuilding) {
                        let pBuildingObj = this.m_pIndoor.m_pBuilding.object3D;
                        if (pBuildingObj) {
                            pBuildingObj.highlight = false;
                        }
                    }
                }
                this.m_pIndoor = pNearest;
                if (pNearest.m_pBuilding) {
                    let pBuildingObj = pNearest.m_pBuilding.object3D;
                    if (pBuildingObj) {
                        pBuildingObj.highlight = true;
                        pBuildingObj.opacity = 128;
                    }
                }
            }
        }
        if (this.m_nLoading || 0 < nTaskCount) {
            this.m_nTaskMax = this.m_nTaskMax < nTaskCount ? nTaskCount : this.m_nTaskMax;
            if (this.m_nLoading || this["InitComplete"]) {
            }
            else {
            }
        }
        else {
            if (this["InitComplete"]) {
                this.m_nTaskMax = 0;
                this["InitComplete"]();
            }
            else {
                if (0 < this.m_nTaskMax) {
                    MiaokitJS.Track("Loaded Tasks");
                    this.m_nTaskMax = 0;
                }
            }
        }
    }
    OnGUI(pCanvas, pCanvasCtx) {
        let nTaskCount = MiaokitJS.Miaokit.progress;
        if (0 !== nTaskCount) {
            return;
        }
        pCanvas.font = "16px Microsoft YaHei";
        pCanvas.strokeStyle = "black";
        pCanvas.lineWidth = 2;
        pCanvas.fillStyle = "#FFFFFF";
        for (let pTile of this.m_aTile) {
            if (pTile.m_aIndoor) {
                for (let pIndoor of pTile.m_aIndoor) {
                    let pPoint = pIndoor.screenPoint;
                    let pText = pIndoor.m_pScene.building_id;
                    let pRect = pCanvasCtx.measureText(pText);
                    pPoint.x = pPoint.x * pCanvas.width;
                    pPoint.y = pPoint.y * pCanvas.height;
                    pCanvasCtx.strokeText(pText, pPoint.x - pRect.width / 2, pPoint.y);
                    pCanvasCtx.fillText(pText, pPoint.x - pRect.width / 2, pPoint.y);
                }
            }
        }
    }
    EnterPark(pPark) {
        this.m_pApp.m_pCameraCtrl.Fly(MiaokitJS.UTIL.CTRL_MODE.PANORAMA, pPark.m_pView, 0.05);
    }
    LockBuilding() {
    }
    EnterCompany(pCompany) {
    }
    InitStartMovie() {
        let pThis = this;
        let pCamera = this.m_pApp.m_pCameraCtrl;
        let pDoing = null;
        let aList = [
            {
                m_pCtrl: "Jump",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: -75126.2, y: 170.0, z: -1438049.8 },
                    m_nDistance: 2003360.0,
                    m_nPitch: 5.0,
                    m_nYaw: -70.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 0.0, y: 170.0, z: 0.0 },
                    m_nDistance: 2003360.0,
                    m_nPitch: 5.0,
                    m_nYaw: -45.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 0.0, y: 170.0, z: 0.0 },
                    m_nDistance: 570475.0,
                    m_nPitch: 5.0,
                    m_nYaw: 90.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_nSpeed: 0.05,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 0.0, y: 170.0, z: 0.0 },
                    m_nDistance: 95500.0,
                    m_nPitch: 19.0,
                    m_nYaw: 90.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_nSpeed: 0.02,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 18.0, y: 170.0, z: -3.0 },
                    m_nDistance: 288.0,
                    m_nPitch: 18.6,
                    m_nYaw: 67.4
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 25.0, y: 170.0, z: -35.0 },
                    m_nDistance: 313.0,
                    m_nPitch: 15.0,
                    m_nYaw: -122.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 25.0, y: 170.0, z: -35.0 },
                    m_nDistance: 313.0,
                    m_nPitch: 15.0,
                    m_nYaw: -122.0
                },
                Do: function () {
                    let nStart = 15.0;
                    let nEnd = 175.0;
                    pDoing = function () {
                        if (nStart > nEnd) {
                            pDoing = null;
                        }
                        else {
                            nStart += 1.0;
                            MiaokitJS.ShaderLab.SetSunlight(0.0, nStart, 1.0);
                        }
                    };
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 125.0, y: 170.0, z: -35.0 },
                    m_nDistance: 130.0,
                    m_nPitch: 35.0,
                    m_nYaw: -270.0
                },
                Do: function () {
                    pThis.ShowIndoor(0, 0, 0);
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 200.0, y: 170.0, z: -35.0 },
                    m_nDistance: 80.0,
                    m_nPitch: 35.0,
                    m_nYaw: -270.0
                },
                Do: function () {
                    pThis.ShowIndoor(0, 0, 1);
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 217.0, y: 170.0, z: -13.0 },
                    m_nDistance: 130.0,
                    m_nPitch: 28.0,
                    m_nYaw: -185.0
                },
                Do: function () {
                    pThis.HideIndoor(0, 0);
                    pThis.ShowIndoor(0, 1, 0);
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 217.0, y: 170.0, z: -13.0 },
                    m_nDistance: 80.0,
                    m_nPitch: 28.0,
                    m_nYaw: -175.0
                },
                Do: function () {
                    pThis.ShowIndoor(0, 1, 1);
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 222.0, y: 170.0, z: 18.0 },
                    m_nDistance: 35.0,
                    m_nPitch: 27.0,
                    m_nYaw: -265.0
                }
            },
            {
                m_pCtrl: "Fly",
                m_nMode: MiaokitJS.UTIL.CTRL_MODE.PANORAMA,
                m_pParam: {
                    m_nLng: 110.344301,
                    m_nLat: 25.272208,
                    m_mTarget: { x: 245.0, y: 170.0, z: 14.0 },
                    m_nDistance: 27.0,
                    m_nPitch: 24.0,
                    m_nYaw: -265.0
                }
            },
        ];
        pThis.m_pStartMovie = (function () {
            let nIndex = 0;
            let pFlash = function () {
                if (0 < nIndex && 120 > pThis.m_nTick) {
                    return false;
                }
                if (!pDoing && !pCamera.m_pFlyTask) {
                    if (nIndex === aList.length) {
                        return true;
                    }
                    let pState = aList[nIndex];
                    if (pState.m_pCtrl) {
                        pCamera[pState.m_pCtrl](pState.m_nMode, pState.m_pParam, pState.m_nSpeed);
                    }
                    if (pState.Do) {
                        pState.Do();
                    }
                    nIndex++;
                }
                else if (pDoing) {
                    pDoing();
                }
                return false;
            };
            return function () {
                if (pFlash()) {
                    pThis.m_pStartMovie = null;
                }
                return {
                    m_pGisDistance: 5 > nIndex ? 50000.0 : 5000.0
                };
            };
        })();
    }
    LoadNavData() {
        let pThis = this;
        let LoadData = function (pTile, aServer, pCallback) {
            MiaokitJS.Request("GET", "json", aServer[0], null, null, function (pSceneList) {
                if (pSceneList && pSceneList.response) {
                    let aScene = pSceneList.response;
                    let nSceneCount = aScene.length;
                    let nSceneIndex = 0;
                    let aLayer = [];
                    let aSite = null;
                    for (let i = 0; i < nSceneCount; i++) {
                        let pScene = aScene[i];
                        pScene.id = pScene.ID;
                        pScene.icon_url = pScene.Icon;
                        pScene.building_id = pScene.BuildingNum;
                        pScene.building_name = pScene.Name;
                        pScene.layerList = null;
                        MiaokitJS.Request("GET", "json", aServer[1] + pScene.id, null, null, function (pLayerList) {
                            if (pLayerList && pLayerList.response) {
                                let aLayer_ = pLayerList.response;
                                for (let pLayer of aLayer_) {
                                    pLayer.id = pLayer.FloorID;
                                    pLayer.b_id = pLayer.FloorID;
                                    pLayer.floor_id = pLayer.FloorID;
                                    pLayer.floor_name = pLayer.name;
                                    pLayer.build_num = pLayer.building_name;
                                    pLayer.build_name = pLayer.building_name;
                                    pLayer.icon = pLayer.iconUrl;
                                    pLayer.detail = pLayer.name;
                                    pLayer.is_default = "0";
                                    pLayer.scene = pScene;
                                    pLayer.sites = [];
                                    aLayer.push(pLayer);
                                }
                                pScene.layerList = aLayer_;
                            }
                            if (++nSceneIndex === nSceneCount) {
                                MiaokitJS.Request("GET", "json", aServer[2], null, null, function (pSiteList) {
                                    if (pSiteList && pSiteList.response) {
                                        aSite = pSiteList.response;
                                        for (let pSite of aSite) {
                                            pSite.HyID = parseInt(pSite.HyID);
                                            pSite.buildingID = "默认值";
                                            pSite.layer = null;
                                            if (2 > pSite.HyID) {
                                                pSite.HyID = 0;
                                            }
                                            for (let pLayer of aLayer) {
                                                if (pLayer.id === pSite.floorID) {
                                                    pSite.layer = pLayer;
                                                    if (pLayer.scene) {
                                                        pSite.buildingID = pScene.building_id;
                                                    }
                                                    pLayer.sites.push(pSite);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    pTile.m_aScene = aScene;
                                    pTile.m_aLayer = aLayer;
                                    pTile.m_aSite = aSite;
                                    pCallback(pTile);
                                });
                            }
                        });
                    }
                }
                else {
                    console.error("加载后台数据失败！");
                    pCallback(pTile);
                }
            });
        };
        for (let pTile of pThis.m_aTile) {
            if (pTile.m_pEasygoServer) {
                let aServer = [
                    pTile.m_pEasygoServer + "api/info/getBuildingListH5.php",
                    pTile.m_pEasygoServer + "api/info/getFloorListH5.php?id=",
                    pTile.m_pEasygoServer + "api/info/getroomlistH5.php",
                ];
                pTile.m_nLoading = 1;
                LoadData(pTile, aServer, function (pTile_) {
                    pTile_.m_nLoading--;
                    if (0 === pTile_.m_nLoading && pTile_.m_pWait) {
                        pTile_.m_pWait(pTile_);
                    }
                });
            }
        }
    }
    ActiveTile(pTile) {
        let pThis = this;
        if (0 !== pTile.m_nLoading) {
            pTile.m_pWait = function (pTile_) {
                pThis.ActiveTile(pTile_);
            };
            return;
        }
        if (!pTile.m_aScene) {
            pTile.m_aScene = [];
        }
        if (!pTile.m_aIndoor) {
            pTile.m_aIndoor = [];
        }
        if (!pTile.m_aLayer) {
            pTile.m_aLayer = [];
        }
        if (!pTile.m_aSite) {
            pTile.m_aSite = [];
        }
        let AddScene = function (pSceneA) {
            let pID = pSceneA.id;
            let pSceneB = {
                BuildingNum: pID,
                Name: pID,
                building_id: pID,
                building_name: pID,
                ID: "0",
                id: "0",
                Icon: "",
                icon_url: "",
                layerList: [],
                m_pScene: pSceneA
            };
            for (let pLayer of pSceneA.layers) {
                pID = pLayer.id;
                let pLayerB = {
                    FloorID: pID,
                    floor_id: pID,
                    id: pID,
                    b_id: pID,
                    name: pID,
                    floor_name: pID,
                    build_name: pSceneB.building_id,
                    build_num: pSceneB.BuildingNum,
                    building_name: pSceneB.building_name,
                    detail: "",
                    icon: null,
                    iconUrl: null,
                    is_default: "0"
                };
                pSceneB.layerList.push(pLayerB);
                pTile.m_aLayer.push(pLayerB);
            }
            for (let pSite of pTile.m_aSite) {
                if (!pSite.layer) {
                    for (let pLayer of pSceneB.layerList) {
                        if (!pSite.floorID || pLayer.id === pSite.floorID) {
                            pSite.layer = pLayer;
                            pSite.floorID = pLayer.floor_id;
                            pSite.buildingID = pSceneB.building_id;
                            break;
                        }
                    }
                }
            }
            pTile.m_aScene.push(pSceneB);
            return pSceneB;
        };
        for (let pSceneA of pTile.m_pTile.scenes) {
            let pScene = null;
            for (let pSceneB of pTile.m_aScene) {
                if (!pSceneB.m_pScene && pSceneA.id === pSceneB.building_id) {
                    pSceneB.m_pScene = pSceneA;
                    pScene = pSceneB;
                    break;
                }
            }
            if (!pScene) {
                pScene = AddScene(pSceneA);
            }
            if (pTile.m_pOutdoorID === pScene.building_id) {
                pTile.m_pOutdoor = pScene;
            }
            else {
                pTile.m_aIndoor.push(new Indoor(pTile, pScene));
            }
        }
        for (let pScene of pTile.m_aScene) {
            let pAdjust = pTile.m_aAdjust[pScene.building_id];
            let pObject = pScene.m_pScene.object3D;
            let bOutdoor = pScene.building_id === pTile.m_pOutdoor.building_id;
            pObject.active = bOutdoor ? true : false;
            for (let pLayerA of pScene.m_pScene.layers) {
                if (pAdjust) {
                    let pObject = pLayerA.object3D;
                    if (pAdjust[0]) {
                        pObject.transform.localPosition = pAdjust[0];
                        pAdjust[0].y += pAdjust[2];
                    }
                    if (pAdjust[1]) {
                        pObject.transform.localEuler = pAdjust[1];
                    }
                }
                if (bOutdoor) {
                    pLayerA._Draw();
                }
                for (let pLayerB of pScene.layerList) {
                    if (pLayerB.floor_id === pLayerA.id) {
                        pLayerB.m_pLayer = pLayerA;
                        break;
                    }
                }
            }
        }
        if (0 === --pThis.m_nLoading) {
            MiaokitJS.Track("Actived Tiles");
            pThis["InitComplete"] = function () {
                MiaokitJS.Track("Showed Tiles");
                pThis["InitComplete"] = null;
                for (let pTile of pThis.m_aTile) {
                    for (let pScene of pTile.m_aScene) {
                        if (pTile.m_pOutdoor.building_id !== pScene.building_id) {
                            for (let pLayer of pScene.layerList) {
                                pLayer.m_pLayer._Draw();
                            }
                        }
                    }
                }
            };
        }
    }
    ShowIndoor(nTile, nScene, nType) {
        let pTile = this.m_aTile[nTile];
        if (pTile) {
            let pScene = pTile.m_aScene[nScene];
            if (pScene && (pScene = pScene.m_pScene)) {
                let pBuilding = pScene.binding;
                if (pBuilding) {
                    let pBuildingObj = pBuilding.object3D;
                    if (pBuildingObj) {
                        if (0 === nType) {
                            pBuildingObj.transparent = true;
                        }
                        else {
                            pBuildingObj.transparent = false;
                            pBuildingObj.active = false;
                        }
                    }
                }
                pScene.object3D.active = true;
                let pPosition = null;
                let nOffset = 0 === nType ? 6.0 : 9.0;
                for (let pLayer of pScene.layers) {
                    let pObject = pLayer.object3D;
                    if (pPosition) {
                        pPosition.y += nOffset;
                        pObject.transform.localPosition = pPosition;
                    }
                    else {
                        pPosition = pObject.transform.localPosition;
                    }
                    pLayer._Draw();
                }
            }
        }
    }
    HideIndoor(nTile, nScene) {
        let pTile = this.m_aTile[nTile];
        if (pTile) {
            let pScene = pTile.m_aScene[nScene];
            if (pScene && (pScene = pScene.m_pScene)) {
                let pBuilding = pScene.binding;
                if (pBuilding) {
                    let pBuildingObj = pBuilding.object3D;
                    if (pBuildingObj) {
                        pBuildingObj.active = true;
                    }
                }
                pScene.object3D.active = false;
            }
        }
    }
}
new Main();
