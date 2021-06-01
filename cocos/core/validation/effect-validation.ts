/*
 Copyright (c) 2020 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

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
 * @module validation
 */

import { EffectAsset, IBlockInfo, IBuiltinInfo, IDefineInfo, IShaderInfo, IAttributeInfo } from '../assets/effect-asset';

export function effectAssetValidation(effect : EffectAsset) : void {

    // Validate effect
    if(!effect || effect === undefined) {
        throw new Error(`Effect is ill-defined`);
    }

    // Validate attached shaders
    effect.shaders.forEach((shader : IShaderInfo) => {
    
        // Validate itself
        if(!shader || shader === undefined) {
            throw new Error(`Shader is NULL`);
        }

        /*        
        shader.attributes.forEach((attribute : IAttributeInfo) => {
            throw new Error('')
        });
        */
        
        shader.defines.forEach((define: IDefineInfo) => {
            if(define.name == "")
                throw new Error(`Shader define has no name`);
        });      
    });
}