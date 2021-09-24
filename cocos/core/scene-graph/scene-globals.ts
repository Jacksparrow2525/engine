/*
 Copyright (c) 2017-2020 Xiamen Yaji Software Co., Ltd.
 http://www.cocos.com
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.
 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @packageDocumentation
 * @module scene-graph
 */

import { ccclass, visible, type, displayOrder, readOnly, slide, range, rangeStep, editable, serializable, rangeMin, tooltip } from 'cc.decorator';
import { TextureCube } from '../assets/texture-cube';
import { CCFloat, CCBoolean, CCInteger } from '../data/utils/attribute';
import { Color, Quat, Vec3, Vec2, color } from '../math';
import { Ambient } from '../renderer/scene/ambient';
import { Shadows, ShadowType, PCFType, ShadowSize } from '../renderer/scene/shadows';
import { Skybox } from '../renderer/scene/skybox';
import { Fog, FogType } from '../renderer/scene/fog';
import { Node } from './node';
import { legacyCC } from '../global-exports';
import { Asset } from '..';
import { Root } from '../root';
import { normalize } from '../asset-manager/helper';

const _up = new Vec3(0, 1, 0);
const _v3 = new Vec3();
const _qt = new Quat();

/**
 * @en Environment lighting information in the Scene
 * @zh 场景的环境光照相关信息
 */
@ccclass('cc.AmbientInfo')
export class AmbientInfo {
    
    //HDR
    @serializable
    protected _skyColor = Float32Array.from([0.2, 0.2, 0.2, 1.0]);
    @serializable
    protected _skyIllum = Ambient.SKY_ILLUM;
    @serializable
    protected _groundAlbedo = Float32Array.from([0.2, 0.5, 0.8, 1.0]);

    //LDR
    @serializable
    protected _skyColor_ldr = Float32Array.from([0.2, 0.2, 0.2, 1.0]);
    @serializable
    protected _skyIllum_ldr = Ambient.SKY_ILLUM;
    @serializable
    protected _groundAlbedo_ldr = Float32Array.from([0.2, 0.5, 0.8, 1.0]);

    protected _resource: Ambient | null = null;

    get skyColor_hdr() {
        return this._skyColor;
    }

    get groundAlbedo_hdr() {
        return this._groundAlbedo;
    }

    get skyIllum_hdr() {
        return this._skyIllum;
    }

    // Normalize HDR color
    private normalizeHdrColor(color : Float32Array) {
        var intensity = 1.0 / Math.max(Math.max(color[0], color[1]), color[2]);

        for(var i = 0; i < 3; ++i) {
            color[i] = color[i] * intensity; 
        }
    }

    /**
     * @en Sky color
     * @zh 天空颜色
     */
    @editable
    set skyColor (val: Color) {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        let clampColor = (x: number) => Math.min(x * 255, 255);
        if(isHDR)
        {
            Vec3.toArray(this._skyColor, val);
            this.normalizeHdrColor(this._skyColor);

            if (this._resource) { this._resource.skyColor = new Color(clampColor(this._skyColor[0]), clampColor(this._skyColor[1]), clampColor(this._skyColor[2]), 255.0); }
        } else {
            Vec3.toArray(this._skyColor_ldr, val);
            if (this._resource) { this._resource.skyColor = new Color(clampColor(this._skyColor_ldr[0]), clampColor(this._skyColor_ldr[1]), clampColor(this._skyColor_ldr[2]), 255.0); }
        }
    }
    get skyColor () {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;       
        let clampColor = (x: number) => Math.min(x * 255, 255);
        if(isHDR) {
            return new Color(clampColor(this._skyColor[0]), clampColor(this._skyColor[1]), clampColor(this._skyColor[2]), 255);
        } else {
            return  new Color(clampColor(this._skyColor_ldr[0]), clampColor(this._skyColor_ldr[1]), clampColor(this._skyColor_ldr[2]), 255);;
        }
    }

    /**
     * @en Sky illuminance
     * @zh 天空亮度
     */
    @editable
    @type(CCFloat)
    set skyIllum (val: number) {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR)
        {
            this._skyIllum = val;
        } else {
            this._skyIllum_ldr = val;
        }

        if (this._resource) { this._resource.skyIllum = val; }
    }
    get skyIllum () {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR)
        {
            return this._skyIllum;
        } else {
            return this._skyIllum_ldr;           
        }
    }

    /**
     * @en Ground color
     * @zh 地面颜色
     */
    @editable
    set groundAlbedo (val: Color) {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        let clampColor = (x: number) => Math.min(x * 255, 255);
        if(isHDR)
        {
            Vec3.toArray(this._groundAlbedo, val);
            this.normalizeHdrColor(this._groundAlbedo);

            if (this._resource) { this._resource.groundAlbedo = new Color(clampColor(this._groundAlbedo[0]), clampColor(this._groundAlbedo[1]), clampColor(this._groundAlbedo[2]), 255.0); }
        } else {
            Vec3.toArray(this._groundAlbedo_ldr, val);
            if (this._resource) { this._resource.groundAlbedo = new Color(clampColor(this._groundAlbedo_ldr[0]), clampColor(this._groundAlbedo_ldr[1]), clampColor(this._groundAlbedo_ldr[2]), 255.0); }
        }

        if (this._resource) { this._resource.groundAlbedo = val; }
    }
    get groundAlbedo () {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        let clampColor = (x: number) => Math.min(x * 255, 255);
        if(isHDR) {
            return new Color(clampColor(this._groundAlbedo[0]), clampColor(this._groundAlbedo[1]), clampColor(this._groundAlbedo[2]), 255);
        } else {
            return new Color(clampColor(this._groundAlbedo_ldr[0]), clampColor(this._groundAlbedo_ldr[1]), clampColor(this._groundAlbedo_ldr[2]), 255);;
        }
    }

    public activate (resource: Ambient) {
        const aa :Ambient = resource;
        this._resource = resource;
        this._resource.initialize(this);
    }
}
legacyCC.AmbientInfo = AmbientInfo;

/**
 * @en Skybox related information
 * @zh 天空盒相关信息
 */
@ccclass('cc.SkyboxInfo')
export class SkyboxInfo {
    @serializable
    protected _applyDiffuseMap = false;
    @serializable
    @type(TextureCube)
    protected _envmap: TextureCube | null = null;
    @serializable
    @type(TextureCube)
    protected _envmap_ldr: TextureCube | null = null;
    @serializable
    @type(TextureCube)
    protected _diffusemap: TextureCube | null = null;
    @serializable
    @type(TextureCube)
    protected _diffusemap_ldr: TextureCube | null = null;
    @serializable
    protected _enabled = false;
    @serializable
    protected _useIBL = false;
    @serializable
    protected _useHDR = false;

    protected _resource: Skybox | null = null;

    /**
     * @en Whether to use diffuse reflection convolution map. Enabled -> Will use map specified. Disabled -> Will revert to hemispheric lighting
     * @zh TODO
     */
     @visible(function(this : SkyboxInfo) {
        if(this.useIBL) {
            return true;
        }
        return false;
    })
     @editable
     set applyDiffuseMap (val) {
         this._applyDiffuseMap = val;

         if(val === false)
         {
            this._diffusemap = null;
         }

        if (this._resource) {
            this._resource.useDiffusemap = val;
        }

     }
     get applyDiffuseMap () {
         return this._applyDiffuseMap;
     }

    /**
     * @en Whether activate skybox in the scene
     * @zh 是否启用天空盒？
     */
    @editable
    set enabled (val) {
        if (this._enabled === val) return;
        this._enabled = val;
        if (this._resource) {
            this._resource.enabled = this._enabled;
        }
    }
    get enabled () {
        return this._enabled;
    }

    /**
     * @en Whether use environment lighting
     * @zh 是否启用环境光照？
     */
    @editable
    set useIBL (val) {
        this._useIBL = val;

        if(!this._useIBL) {
            this._diffusemap = null;
            this._applyDiffuseMap = false;
        }

        if (this._resource) { 
            this._resource.useIBL = this._useIBL; 
            this._resource.useDiffusemap = this.applyDiffuseMap;
            this._resource.diffusemap = this._diffusemap
        }
    }
    get useIBL () {
        return this._useIBL;
    }

    /**
     * @en Toggle HDR (TODO: This SHOULD be moved into it's own subgroup away from skybox)
     * @zh TODO
     */
     @editable
     set useHDR (val) {
        (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR = val;
        this._useHDR = val;

        // Switch UI to and from LDR/HDR textures depends on HDR state
        if(this._resource)
        {
            this._envmap = this._resource.envmap;
        }

        if (this._resource) { this._resource.useHDR = this._useHDR; }
     }
     get useHDR () {
        (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR = this._useHDR;
         return this._useHDR;
     }
    
    /**
     * @en The texture cube used for the skybox
     * @zh 使用的立方体贴图
     */
    @editable
    @type(TextureCube)
    set envmap (val) {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR) {
            this._envmap = val;
            if (this._resource) { this._resource.envmap = this._envmap; }
        } else {
            this._envmap_ldr = val;
            if (this._resource) { this._resource.envmap = this._envmap_ldr; }           
        }
        
        if(!this._envmap)
        {
            this._diffusemap = null;
            this._applyDiffuseMap = false;
            this.useIBL = false;
        }

        if (this._resource) {
            this._resource.useDiffusemap = this.applyDiffuseMap;

            if(isHDR) {
                this._resource.diffusemap = this._diffusemap;
            } else {
                this._resource.diffusemap = this._diffusemap_ldr;
            }
        }
    }
    get envmap () {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR) {
            return this._envmap;
        } else {
            return this._envmap_ldr;
        }
    }

    /**
     * @en The optional diffusion convolution map used in tandem with IBL
     * @zh TODO
     */
    @visible(function(this : SkyboxInfo) {
        if(this.useIBL) {
            return true;
        }
        return false;
    })
    @editable
    @readOnly
    @type(TextureCube)
    set diffusemap(val : TextureCube | null) { 
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR) {
            this._diffusemap = val;
        } else {
            this._diffusemap_ldr = val;
        }

        // The diffusion relfection convolution as been set by the editor at this time, so we can pass it to skybox.ts
        if(this._resource) {
            this._resource.diffusemap = val;
        }
    }
    get diffusemap() {
        const isHDR = (legacyCC.director.root as Root).pipeline.pipelineSceneData.isHDR;
        if(isHDR) {
            return this._diffusemap;
        } else {
            return this._diffusemap_ldr;
        }
    }

    public activate (resource: Skybox) {
        this._resource = resource;
        this._resource.initialize(this);
        this._resource.activate(); // update global DS first
    }
}
legacyCC.SkyboxInfo = SkyboxInfo;

/**
 * @zh 全局雾相关信息
 * @en Global fog info
 */
@ccclass('cc.FogInfo')
export class FogInfo {
    public static FogType = FogType;
    @serializable
    protected _type = FogType.LINEAR;
    @serializable
    protected _fogColor = new Color('#C8C8C8');
    @serializable
    protected _enabled = false;
    @serializable
    protected _fogDensity = 0.3;
    @serializable
    protected _fogStart = 0.5;
    @serializable
    protected _fogEnd = 300;
    @serializable
    protected _fogAtten = 5;
    @serializable
    protected _fogTop = 1.5;
    @serializable
    protected _fogRange = 1.2;
    protected _resource: Fog | null = null;
    /**
     * @zh 是否启用全局雾效
     * @en Enable global fog
     */
    @editable
    set enabled (val: boolean) {
        if (this._enabled === val) return;
        this._enabled = val;
        if (this._resource) {
            this._resource.enabled = val;
            if (val) {
                this._resource.type = this._type;
            }
        }
    }

    get enabled () {
        return this._enabled;
    }

    /**
     * @zh 全局雾颜色
     * @en Global fog color
     */
    @editable
    set fogColor (val: Color) {
        this._fogColor.set(val);
        if (this._resource) { this._resource.fogColor = this._fogColor; }
    }

    get fogColor () {
        return this._fogColor;
    }

    /**
     * @zh 全局雾类型
     * @en Global fog type
     */
    @editable
    @type(FogType)
    get type () {
        return this._type;
    }

    set type (val) {
        this._type = val;
        if (this._resource) { this._resource.type = val; }
    }

    /**
     * @zh 全局雾浓度
     * @en Global fog density
     */
    @visible(function (this: FogInfo) {
        return this._type !== FogType.LAYERED && this._type !== FogType.LINEAR;
    })
    @type(CCFloat)
    @range([0, 1])
    @rangeStep(0.01)
    @slide
    @displayOrder(3)
    get fogDensity () {
        return this._fogDensity;
    }

    set fogDensity (val) {
        this._fogDensity = val;
        if (this._resource) { this._resource.fogDensity = val; }
    }

    /**
     * @zh 雾效起始位置，只适用于线性雾
     * @en Global fog start position, only for linear fog
     */
    @visible(function (this: FogInfo) { return this._type === FogType.LINEAR; })
    @type(CCFloat)
    @rangeStep(0.01)
    @displayOrder(4)
    get fogStart () {
        return this._fogStart;
    }

    set fogStart (val) {
        this._fogStart = val;
        if (this._resource) { this._resource.fogStart = val; }
    }

    /**
     * @zh 雾效结束位置，只适用于线性雾
     * @en Global fog end position, only for linear fog
     */
    @visible(function (this: FogInfo) { return this._type === FogType.LINEAR; })
    @type(CCFloat)
    @rangeStep(0.01)
    @displayOrder(5)
    get fogEnd () {
        return this._fogEnd;
    }

    set fogEnd (val) {
        this._fogEnd = val;
        if (this._resource) { this._resource.fogEnd = val; }
    }

    /**
     * @zh 雾效衰减
     * @en Global fog attenuation
     */
    @visible(function (this: FogInfo) { return this._type !== FogType.LINEAR; })
    @type(CCFloat)
    @rangeMin(0.01)
    @rangeStep(0.01)
    @displayOrder(6)
    get fogAtten () {
        return this._fogAtten;
    }

    set fogAtten (val) {
        this._fogAtten = val;
        if (this._resource) { this._resource.fogAtten = val; }
    }

    /**
     * @zh 雾效顶部范围，只适用于层级雾
     * @en Global fog top range, only for layered fog
     */
    @visible(function (this: FogInfo) { return this._type === FogType.LAYERED; })
    @type(CCFloat)
    @rangeStep(0.01)
    @displayOrder(7)
    get fogTop () {
        return this._fogTop;
    }

    set fogTop (val) {
        this._fogTop = val;
        if (this._resource) { this._resource.fogTop = val; }
    }

    /**
     * @zh 雾效范围，只适用于层级雾
     * @en Global fog range, only for layered fog
     */
    @visible(function (this: FogInfo) { return this._type === FogType.LAYERED; })
    @type(CCFloat)
    @rangeStep(0.01)
    @displayOrder(8)
    get fogRange () {
        return this._fogRange;
    }

    set fogRange (val) {
        this._fogRange = val;
        if (this._resource) { this._resource.fogRange = val; }
    }

    public activate (resource: Fog) {
        this._resource = resource;
        this._resource.initialize(this);
        this._resource.activate();
    }
}

/**
 * @en Scene level planar shadow related information
 * @zh 平面阴影相关信息
 */
@ccclass('cc.ShadowsInfo')
export class ShadowsInfo {
    @serializable
    protected _type = ShadowType.Planar;
    @serializable
    protected _enabled = false;
    @serializable
    protected _normal = new Vec3(0, 1, 0);
    @serializable
    protected _distance = 0;
    @serializable
    protected _shadowColor = new Color(0, 0, 0, 76);
    @serializable
    protected _fixedArea = false;
    @serializable
    protected _pcf = PCFType.HARD;
    @serializable
    protected _bias = 0.00001;
    @serializable
    protected _normalBias = 0.0;
    @serializable
    protected _near = 0.1;
    @serializable
    protected _far = 10.0;
    @serializable
    protected _shadowDistance = 100;
    @serializable
    protected _invisibleOcclusionRange = 200;
    @serializable
    protected _orthoSize = 5;
    @serializable
    protected _maxReceived = 4;
    @serializable
    protected _size = new Vec2(512, 512);
    @serializable
    protected _saturation = 0.75;

    protected _resource: Shadows | null = null;

    /**
     * @en Whether activate planar shadow
     * @zh 是否启用平面阴影？
     */
    @editable
    set enabled (val: boolean) {
        if (this._enabled === val) return;
        this._enabled = val;
        if (this._resource) {
            this._resource.enabled = val;
            if (val) {
                this._resource.type = this._type;
            }
        }
    }
    get enabled () {
        return this._enabled;
    }

    @editable
    @type(ShadowType)
    set type (val) {
        this._type = val;
        if (this._resource) { this._resource.type = val; }
    }
    get type () {
        return this._type;
    }

    /**
     * @en Shadow color
     * @zh 阴影颜色
     */
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.Planar; })
    set shadowColor (val: Color) {
        this._shadowColor.set(val);
        if (this._resource) { this._resource.shadowColor = val; }
    }
    get shadowColor () {
        return this._shadowColor;
    }

    /**
     * @en The normal of the plane which receives shadow
     * @zh 阴影接收平面的法线
     */
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.Planar; })
    set normal (val: Vec3) {
        Vec3.copy(this._normal, val);
        if (this._resource) { this._resource.normal = val; }
    }
    get normal () {
        return this._normal;
    }

    /**
     * @en The distance from coordinate origin to the receiving plane.
     * @zh 阴影接收平面与原点的距离
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.Planar; })
    set distance (val: number) {
        this._distance = val;
        if (this._resource) { this._resource.distance = val; }
    }
    get distance () {
        return this._distance;
    }

    /**
     * @en Shadow color saturation
     * @zh 阴影颜色饱和度
     */
    @editable
    @range([0.0, 1.0, 0.01])
    @slide
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set saturation (val: number) {
        if (val > 1.0) {
            this._saturation = val / val;
            if (this._resource) { this._resource.saturation = val / val; }
        } else {
            this._saturation = val;
            if (this._resource) { this._resource.saturation = val; }
        }
    }
    get saturation () {
        return this._saturation;
    }

    /**
     * @en The normal of the plane which receives shadow
     * @zh 阴影接收平面的法线
     */
    @type(PCFType)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set pcf (val) {
        this._pcf = val;
        if (this._resource) { this._resource.pcf = val; }
    }
    get pcf () {
        return this._pcf;
    }

    /**
     * @en get or set shadow max received
     * @zh 获取或者设置阴影接收的最大光源数量
     */
    @type(CCInteger)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set maxReceived (val: number) {
        this._maxReceived = val;
        if (this._resource) { this._resource.maxReceived = val; }
    }
    get maxReceived () {
        return this._maxReceived;
    }

    /**
     * @en get or set shadow map sampler offset
     * @zh 获取或者设置阴影纹理偏移值
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set bias (val: number) {
        this._bias = val;
        if (this._resource) { this._resource.bias = val; }
    }
    get bias () {
        return this._bias;
    }

    /**
     * @en on or off Self-shadowing.
     * @zh 打开或者关闭自阴影。
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set normalBias (val: number) {
        this._normalBias = val;
        if (this._resource) { this._resource.normalBias = val; }
    }
    get normalBias () {
        return this._normalBias;
    }

    /**
     * @en get or set shadow map size
     * @zh 获取或者设置阴影纹理大小
     */
    @type(ShadowSize)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set shadowMapSize (value: number) {
        this._size.set(value, value);
        if (this._resource) {
            this._resource.size.set(value, value);
            this._resource.shadowMapDirty = true;
        }
    }
    get shadowMapSize () {
        return this._size.x;
    }
    get size () {
        return this._size;
    }

    /**
     * @en get or set fixed area shadow
     * @zh 是否是固定区域阴影
     */
    @type(CCBoolean)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap; })
    set fixedArea (val) {
        this._fixedArea = val;
        if (this._resource) { this._resource.fixedArea = val; }
    }
    get fixedArea () {
        return this._fixedArea;
    }

    /**
     * @en get or set shadow camera near
     * @zh 获取或者设置阴影相机近裁剪面
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap && this._fixedArea === true; })
    set near (val: number) {
        this._near = val;
        if (this._resource) { this._resource.near = val; }
    }
    get near () {
        return this._near;
    }

    /**
     * @en get or set shadow camera far
     * @zh 获取或者设置阴影相机远裁剪面
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap && this._fixedArea === true; })
    set far (val: number) {
        this._far = Math.min(val, 2000.0);
        if (this._resource) { this._resource.far = Math.min(val, 2000.0); }
    }
    get far () {
        return this._far;
    }

    /**
     * @en get or set shadow camera far
     * @zh 获取或者设置潜在阴影产生的范围
     */
    @editable
    @tooltip('if shadow has been culled, increase this value to fix it')
    @range([0.0, 2000.0, 0.1])
    @slide
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap && this._fixedArea === false; })
    set invisibleOcclusionRange (val: number) {
        this._invisibleOcclusionRange = Math.min(val, 2000.0);
        if (this._resource) {
            this._resource.invisibleOcclusionRange = Math.min(val, 2000.0);
        }
    }
    get invisibleOcclusionRange () {
        return this._invisibleOcclusionRange;
    }

    /**
     * @en get or set shadow camera far
     * @zh 获取或者设置潜在阴影产生的范围
     */
    @editable
    @tooltip('shadow visible distance: shadow quality is inversely proportional of the magnitude of this value')
    @range([0.0, 2000.0, 0.1])
    @slide
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap && this._fixedArea === false; })
    set shadowDistance (val: number) {
        this._shadowDistance = Math.min(val, 2000.0);
        if (this._resource) {
            this._resource.shadowDistance = Math.min(val, 2000.0);
        }
    }
    get shadowDistance () {
        return this._shadowDistance;
    }

    /**
     * @en get or set shadow camera orthoSize
     * @zh 获取或者设置阴影相机正交大小
     */
    @type(CCFloat)
    @visible(function (this: ShadowsInfo) { return this._type === ShadowType.ShadowMap && this._fixedArea === true; })
    set orthoSize (val: number) {
        this._orthoSize = val;
        if (this._resource) { this._resource.orthoSize = val; }
    }
    get orthoSize () {
        return this._orthoSize;
    }

    /**
     * @en Set plane which receives shadow with the given node's world transformation
     * @zh 根据指定节点的世界变换设置阴影接收平面的信息
     * @param node The node for setting up the plane
     */
    public setPlaneFromNode (node: Node) {
        node.getWorldRotation(_qt);
        this.normal = Vec3.transformQuat(_v3, _up, _qt);
        node.getWorldPosition(_v3);
        this.distance = Vec3.dot(this._normal, _v3);
    }

    public activate (resource: Shadows) {
        this._resource = resource;
        this.pcf = Math.min(this._pcf, PCFType.SOFT_2X);
        this._resource.initialize(this);
        this._resource.activate();
    }
}
legacyCC.ShadowsInfo = ShadowsInfo;

/**
 * @en All scene related global parameters, it affects all content in the corresponding scene
 * @zh 各类场景级别的渲染参数，将影响全场景的所有物体
 */
@ccclass('cc.SceneGlobals')
export class SceneGlobals {
    /**
     * @en The environment light information
     * @zh 场景的环境光照相关信息
     */
    @serializable
    @editable
    public ambient = new AmbientInfo();
    /**
     * @en Scene level planar shadow related information
     * @zh 平面阴影相关信息
     */
    @serializable
    @editable
    public shadows = new ShadowsInfo();
    @serializable
    public _skybox = new SkyboxInfo();
    @editable
    @serializable
    public fog = new FogInfo();

    /**
     * @en Skybox related information
     * @zh 天空盒相关信息
     */
    @editable
    @type(SkyboxInfo)
    get skybox () {
        return this._skybox;
    }
    set skybox (value) {
        this._skybox = value;
    }

    public activate () {
        const sceneData = legacyCC.director.root.pipeline.pipelineSceneData;
        this.ambient.activate(sceneData.ambient);
        this.skybox.activate(sceneData.skybox);

        this.shadows.activate(sceneData.shadows);
        this.fog.activate(sceneData.fog);
    }
}
legacyCC.SceneGlobals = SceneGlobals;
