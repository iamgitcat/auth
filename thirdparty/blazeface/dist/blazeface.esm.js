/**
    * @license
    * Copyright 2021 Google LLC. All Rights Reserved.
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    * http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    * =============================================================================
    */
import{slice,add,div,sub,mul,concat2d,Tensor,tidy,concat,tensor1d,squeeze,tensor2d,image,sigmoid,reshape,browser,expandDims,cast}from"@tensorflow/tfjs-core";import{loadGraphModel}from"@tensorflow/tfjs-converter";function __awaiter(e,t,r,n){return new(r||(r=Promise))(function(o,i){function a(e){try{c(n.next(e))}catch(e){i(e)}}function s(e){try{c(n.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?o(e.value):(t=e.value,t instanceof r?t:new r(function(e){e(t)})).then(a,s)}c((n=n.apply(e,t||[])).next())})}function __generator(e,t){var r,n,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(r)throw new TypeError("Generator is already executing.");for(;a;)try{if(r=1,n&&(o=2&i[0]?n.return:i[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,i[1])).done)return o;switch(n=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,n=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],n=0}finally{r=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}}var disposeBox=function(e){e.startEndTensor.dispose(),e.startPoint.dispose(),e.endPoint.dispose()},createBox=function(e){return{startEndTensor:e,startPoint:slice(e,[0,0],[-1,2]),endPoint:slice(e,[0,2],[-1,2])}},scaleBox=function(e,t){var r=mul(e.startPoint,t),n=mul(e.endPoint,t),o=concat2d([r,n],1);return createBox(o)},NUM_LANDMARKS=6;function generateAnchors(e,t,r){for(var n=[],o=0;o<r.strides.length;o++)for(var i=r.strides[o],a=Math.floor((t+i-1)/i),s=Math.floor((e+i-1)/i),c=r.anchors[o],l=0;l<a;l++)for(var u=i*(l+.5),d=0;d<s;d++)for(var h=i*(d+.5),f=0;f<c;f++)n.push([h,u]);return n}function decodeBounds(e,t,r){var n=slice(e,[0,1],[-1,2]),o=add(n,t),i=slice(e,[0,3],[-1,2]),a=div(i,r),s=div(o,r),c=div(a,2),l=sub(s,c),u=add(s,c),d=mul(l,r),h=mul(u,r);return concat2d([d,h],1)}function getInputTensorDimensions(e){return e instanceof Tensor?[e.shape[0],e.shape[1]]:[e.height,e.width]}function flipFaceHorizontal(e,t){var r,n,o;if(e.topLeft instanceof Tensor&&e.bottomRight instanceof Tensor){var i=tidy(function(){return[concat([slice(sub(t-1,e.topLeft),0,1),slice(e.topLeft,1,1)]),concat([sub(t-1,slice(e.bottomRight,0,1)),slice(e.bottomRight,1,1)])]});r=i[0],n=i[1],null!=e.landmarks&&(o=tidy(function(){var r=sub(tensor1d([t-1,0]),e.landmarks),n=tensor1d([1,-1]);return mul(r,n)}))}else{var a=e.topLeft,s=a[0],c=a[1],l=e.bottomRight,u=l[0],d=l[1];r=[t-1-s,c],n=[t-1-u,d],null!=e.landmarks&&(o=e.landmarks.map(function(e){return[t-1-e[0],e[1]]}))}var h={topLeft:r,bottomRight:n};return null!=o&&(h.landmarks=o),null!=e.probability&&(h.probability=e.probability instanceof Tensor?e.probability.clone():e.probability),h}function scaleBoxFromPrediction(e,t){return tidy(function(){var r;return r=e.hasOwnProperty("box")?e.box:e,squeeze(scaleBox(r,t).startEndTensor)})}var BlazeFaceModel=function(){function e(e,t,r,n,o,i){this.blazeFaceModel=e,this.width=t,this.height=r,this.maxFaces=n;var a={strides:[t/16,t/8],anchors:[2,6]};this.anchorsData=generateAnchors(t,r,a),this.anchors=tensor2d(this.anchorsData),this.inputSize=tensor1d([t,r]),this.iouThreshold=o,this.scoreThreshold=i}return e.prototype.resizeAspectRatio=function(e,t,r){var n=e.shape[2],o=e.shape[1];if(!t||!r)return{ratio:1,image:e};var i=Math.min(t/n,r/o),a=Math.round(n*i),s=Math.round(o*i);return{ratio:i,image:image.resizeBilinear(e,[s,a])}},e.prototype.getBoundingBoxes=function(e,t,r){return void 0===r&&(r=!0),__awaiter(this,void 0,void 0,function(){var n,o,i,a,s,c,l,u,d,h,f,p,b,m=this;return __generator(this,function(v){switch(v.label){case 0:return n=tidy(function(){var t=m.resizeAspectRatio(e,m.width,m.height),r=tensor2d([[1,0,0,0,1,0,0,0]]),n=image.transform(t.image,r,"nearest","constant",0,[m.width,m.height]),o=mul(sub(div(n,255),.5),2),i=m.blazeFaceModel.predict(o).sort(function(e,t){return e.size-t.size}),a=concat([i[0],i[2]],2),s=concat([i[1],i[3]],2),c=concat([s,a],1),l=squeeze(c),u=decodeBounds(l,m.anchors,m.inputSize),d=slice(l,[0,0],[-1,1]);return[l,u,squeeze(sigmoid(d)),t.ratio]}),o=n[0],i=n[1],a=n[2],s=n[3],c=console.warn,console.warn=function(){},l=image.nonMaxSuppression(i,a,this.maxFaces,this.iouThreshold,this.scoreThreshold),console.warn=c,[4,l.array()];case 1:return u=v.sent(),l.dispose(),d=u.map(function(e){return slice(i,[e,0],[1,-1])}),t?[3,3]:[4,Promise.all(d.map(function(e){return __awaiter(m,void 0,void 0,function(){var t;return __generator(this,function(r){switch(r.label){case 0:return[4,e.array()];case 1:return t=r.sent(),e.dispose(),[2,t]}})})}))];case 2:d=v.sent(),v.label=3;case 3:for(h=t?div([1,1],s):[1/s,1/s],f=[],p=function(e){var n=d[e],i=tidy(function(){var i=createBox(n instanceof Tensor?n:tensor2d(n));if(!r)return i;var s,c=u[e];return s=t?slice(m.anchors,[c,0],[1,2]):m.anchorsData[c],{box:i,landmarks:reshape(squeeze(slice(o,[c,NUM_LANDMARKS-1],[1,-1])),[NUM_LANDMARKS,-1]),probability:slice(a,[c],[1]),anchor:s}});f.push(i)},b=0;b<d.length;b++)p(b);return i.dispose(),a.dispose(),o.dispose(),[2,{boxes:f,scaleFactor:h}]}})})},e.prototype.estimateFaces=function(e,t,r,n){return void 0===t&&(t=!1),void 0===r&&(r=!1),void 0===n&&(n=!0),__awaiter(this,void 0,void 0,function(){var o,i,a,s,c,l,u=this;return __generator(this,function(d){switch(d.label){case 0:return o=getInputTensorDimensions(e),i=o[1],a=tidy(function(){return e instanceof Tensor||(e=browser.fromPixels(e)),expandDims(cast(e,"float32"),0)}),[4,this.getBoundingBoxes(a,t,n)];case 1:return s=d.sent(),c=s.boxes,l=s.scaleFactor,a.dispose(),t?[2,c.map(function(e){var t=scaleBoxFromPrediction(e,l),o={topLeft:slice(t,[0],[2]),bottomRight:slice(t,[2],[2])};if(n){var a=e,s=a.landmarks,c=a.probability,u=a.anchor,d=mul(add(s,u),l);o.landmarks=d,o.probability=c}return r&&(o=flipFaceHorizontal(o,i)),o})]:[2,Promise.all(c.map(function(e){return __awaiter(u,void 0,void 0,function(){var t,o,a,s,c,u,d,h,f,p,b,m=this;return __generator(this,function(v){switch(v.label){case 0:return t=scaleBoxFromPrediction(e,l),n?[3,2]:[4,t.array()];case 1:return c=v.sent(),o={topLeft:c.slice(0,2),bottomRight:c.slice(2)},[3,4];case 2:return[4,Promise.all([e.landmarks,t,e.probability].map(function(e){return __awaiter(m,void 0,void 0,function(){return __generator(this,function(t){return[2,e.array()]})})}))];case 3:a=v.sent(),s=a[0],c=a[1],u=a[2],d=e.anchor,f=(h=l)[0],p=h[1],b=s.map(function(e){return[(e[0]+d[0])*f,(e[1]+d[1])*p]}),o={topLeft:c.slice(0,2),bottomRight:c.slice(2),landmarks:b,probability:u},disposeBox(e.box),e.landmarks.dispose(),e.probability.dispose(),v.label=4;case 4:return t.dispose(),r&&(o=flipFaceHorizontal(o,i)),[2,o]}})})}))]}})})},e.prototype.dispose=function(){null!=this.blazeFaceModel&&this.blazeFaceModel.dispose()},e}(),BLAZEFACE_MODEL_URL="https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1";function load(e){var t=void 0===e?{}:e,r=t.maxFaces,n=void 0===r?10:r,o=t.inputWidth,i=void 0===o?128:o,a=t.inputHeight,s=void 0===a?128:a,c=t.iouThreshold,l=void 0===c?.3:c,u=t.scoreThreshold,d=void 0===u?.75:u,h=t.modelUrl;return __awaiter(this,void 0,void 0,function(){var e;return __generator(this,function(t){switch(t.label){case 0:return null==h?[3,2]:[4,loadGraphModel(h)];case 1:return e=t.sent(),[3,4];case 2:return[4,loadGraphModel(BLAZEFACE_MODEL_URL,{fromTFHub:!0})];case 3:e=t.sent(),t.label=4;case 4:return[2,new BlazeFaceModel(e,i,s,n,l,d)]}})})}export{load,BlazeFaceModel};
