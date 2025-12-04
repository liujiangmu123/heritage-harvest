import{c as ge,r as u,j as n,A as J,m as D,b as ve,H as we}from"./index-CCr_emsx.js";import{u as ye,_ as Y,C as be,O as Se,a as le}from"./OrbitControls-BPu6_TR5.js";import{I as je,F as Z,y as V,z,E as _e,B as k,f as ce,V as S,k as Ee,U as K,G as Q,e as c,b as Ae,i as P,J as Le,d as Me,w as Ce,C as Ue}from"./three.module-C2hvsvVY.js";import{B as ee}from"./Button-BZClZfIC.js";import{P as Ne}from"./play-B_rgOq2g.js";import{R as ze}from"./rotate-ccw-BwIt3_Ik.js";import{C as Pe}from"./chevron-right-DLXJYZcf.js";import{P as Be}from"./PerspectiveCamera-CqiF7Uh_.js";import{u as Oe}from"./Progress-B1fbVZn4.js";import{H as De}from"./Html-C21rutTc.js";import{v as de}from"./constants-Ck1MbfUW.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=ge("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),fe=de>=125?"uv1":"uv2",te=new k,R=new S;class q extends je{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],s=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(s),this.setAttribute("position",new Z(e,3)),this.setAttribute("uv",new Z(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,s=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),s.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const s=new V(t,6,1);return this.setAttribute("instanceStart",new z(s,3,0)),this.setAttribute("instanceEnd",new z(s,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let s;e instanceof Float32Array?s=e:Array.isArray(e)&&(s=new Float32Array(e));const i=new V(s,t*2,1);return this.setAttribute("instanceColorStart",new z(i,t,0)),this.setAttribute("instanceColorEnd",new z(i,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new _e(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new k);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),te.setFromBufferAttribute(t),this.boundingBox.union(te))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ce),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const s=this.boundingSphere.center;this.boundingBox.getCenter(s);let i=0;for(let o=0,r=e.count;o<r;o++)R.fromBufferAttribute(e,o),i=Math.max(i,s.distanceToSquared(R)),R.fromBufferAttribute(t,o),i=Math.max(i,s.distanceToSquared(R));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class ue extends q{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,s=new Float32Array(2*t);for(let i=0;i<t;i+=3)s[2*i]=e[i],s[2*i+1]=e[i+1],s[2*i+2]=e[i+2],s[2*i+3]=e[i+3],s[2*i+4]=e[i+4],s[2*i+5]=e[i+5];return super.setPositions(s),this}setColors(e,t=3){const s=e.length-t,i=new Float32Array(2*s);if(t===3)for(let o=0;o<s;o+=t)i[2*o]=e[o],i[2*o+1]=e[o+1],i[2*o+2]=e[o+2],i[2*o+3]=e[o+3],i[2*o+4]=e[o+4],i[2*o+5]=e[o+5];else for(let o=0;o<s;o+=t)i[2*o]=e[o],i[2*o+1]=e[o+1],i[2*o+2]=e[o+2],i[2*o+3]=e[o+3],i[2*o+4]=e[o+4],i[2*o+5]=e[o+5],i[2*o+6]=e[o+6],i[2*o+7]=e[o+7];return super.setColors(i,t),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class $ extends Ee{constructor(e){super({type:"LineMaterial",uniforms:K.clone(K.merge([Q.common,Q.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new c(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${de>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(t){this.uniforms.diffuse.value=t}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(t){this.uniforms.linewidth.value=t}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(t){!!t!="USE_DASH"in this.defines&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(t){this.uniforms.dashScale.value=t}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(t){this.uniforms.dashSize.value=t}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(t){this.uniforms.dashOffset.value=t}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(t){this.uniforms.gapSize.value=t}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(t){this.uniforms.opacity.value=t}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(t){this.uniforms.resolution.value.copy(t)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(t){!!t!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),t===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const G=new P,ne=new S,ie=new S,p=new P,x=new P,_=new P,W=new S,F=new Me,g=new Le,se=new S,I=new k,H=new ce,E=new P;let A,U;function oe(a,e,t){return E.set(0,0,-e,1).applyMatrix4(a.projectionMatrix),E.multiplyScalar(1/E.w),E.x=U/t.width,E.y=U/t.height,E.applyMatrix4(a.projectionMatrixInverse),E.multiplyScalar(1/E.w),Math.abs(Math.max(E.x,E.y))}function Re(a,e){const t=a.matrixWorld,s=a.geometry,i=s.attributes.instanceStart,o=s.attributes.instanceEnd,r=Math.min(s.instanceCount,i.count);for(let l=0,v=r;l<v;l++){g.start.fromBufferAttribute(i,l),g.end.fromBufferAttribute(o,l),g.applyMatrix4(t);const y=new S,w=new S;A.distanceSqToSegment(g.start,g.end,w,y),w.distanceTo(y)<U*.5&&e.push({point:w,pointOnLine:y,distance:A.origin.distanceTo(w),object:a,face:null,faceIndex:l,uv:null,[fe]:null})}}function Ie(a,e,t){const s=e.projectionMatrix,o=a.material.resolution,r=a.matrixWorld,l=a.geometry,v=l.attributes.instanceStart,y=l.attributes.instanceEnd,w=Math.min(l.instanceCount,v.count),m=-e.near;A.at(1,_),_.w=1,_.applyMatrix4(e.matrixWorldInverse),_.applyMatrix4(s),_.multiplyScalar(1/_.w),_.x*=o.x/2,_.y*=o.y/2,_.z=0,W.copy(_),F.multiplyMatrices(e.matrixWorldInverse,r);for(let b=0,h=w;b<h;b++){if(p.fromBufferAttribute(v,b),x.fromBufferAttribute(y,b),p.w=1,x.w=1,p.applyMatrix4(F),x.applyMatrix4(F),p.z>m&&x.z>m)continue;if(p.z>m){const f=p.z-x.z,d=(p.z-m)/f;p.lerp(x,d)}else if(x.z>m){const f=x.z-p.z,d=(x.z-m)/f;x.lerp(p,d)}p.applyMatrix4(s),x.applyMatrix4(s),p.multiplyScalar(1/p.w),x.multiplyScalar(1/x.w),p.x*=o.x/2,p.y*=o.y/2,x.x*=o.x/2,x.y*=o.y/2,g.start.copy(p),g.start.z=0,g.end.copy(x),g.end.z=0;const M=g.closestPointToPointParameter(W,!0);g.at(M,se);const C=Ce.lerp(p.z,x.z,M),L=C>=-1&&C<=1,N=W.distanceTo(se)<U*.5;if(L&&N){g.start.fromBufferAttribute(v,b),g.end.fromBufferAttribute(y,b),g.start.applyMatrix4(r),g.end.applyMatrix4(r);const f=new S,d=new S;A.distanceSqToSegment(g.start,g.end,d,f),t.push({point:d,pointOnLine:f,distance:A.origin.distanceTo(d),object:a,face:null,faceIndex:b,uv:null,[fe]:null})}}}class me extends Ae{constructor(e=new q,t=new $({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,s=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let r=0,l=0,v=t.count;r<v;r++,l+=2)ne.fromBufferAttribute(t,r),ie.fromBufferAttribute(s,r),i[l]=l===0?0:i[l-1],i[l+1]=i[l]+ne.distanceTo(ie);const o=new V(i,2,1);return e.setAttribute("instanceDistanceStart",new z(o,1,0)),e.setAttribute("instanceDistanceEnd",new z(o,1,1)),this}raycast(e,t){const s=this.material.worldUnits,i=e.camera;i===null&&!s&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const o=e.params.Line2!==void 0&&e.params.Line2.threshold||0;A=e.ray;const r=this.matrixWorld,l=this.geometry,v=this.material;U=v.linewidth+o,l.boundingSphere===null&&l.computeBoundingSphere(),H.copy(l.boundingSphere).applyMatrix4(r);let y;if(s)y=U*.5;else{const m=Math.max(i.near,H.distanceToPoint(A.origin));y=oe(i,m,v.resolution)}if(H.radius+=y,A.intersectsSphere(H)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),I.copy(l.boundingBox).applyMatrix4(r);let w;if(s)w=U*.5;else{const m=Math.max(i.near,I.distanceToPoint(A.origin));w=oe(i,m,v.resolution)}I.expandByScalar(w),A.intersectsBox(I)!==!1&&(s?Re(this,t):Ie(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(G),this.material.uniforms.resolution.value.set(G.z,G.w))}}class He extends me{constructor(e=new ue,t=new $({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const ae=u.forwardRef(function({points:e,color:t=16777215,vertexColors:s,linewidth:i,lineWidth:o,segments:r,dashed:l,...v},y){var w,m;const b=ye(L=>L.size),h=u.useMemo(()=>r?new me:new He,[r]),[j]=u.useState(()=>new $),M=(s==null||(w=s[0])==null?void 0:w.length)===4?4:3,C=u.useMemo(()=>{const L=r?new q:new ue,N=e.map(f=>{const d=Array.isArray(f);return f instanceof S||f instanceof P?[f.x,f.y,f.z]:f instanceof c?[f.x,f.y,0]:d&&f.length===3?[f[0],f[1],f[2]]:d&&f.length===2?[f[0],f[1],0]:f});if(L.setPositions(N.flat()),s){t=16777215;const f=s.map(d=>d instanceof Ue?d.toArray():d);L.setColors(f.flat(),M)}return L},[e,r,s,M]);return u.useLayoutEffect(()=>{h.computeLineDistances()},[e,h]),u.useLayoutEffect(()=>{l?j.defines.USE_DASH="":delete j.defines.USE_DASH,j.needsUpdate=!0},[l,j]),u.useEffect(()=>()=>{C.dispose(),j.dispose()},[C]),u.createElement("primitive",Y({object:h,ref:y},v),u.createElement("primitive",{object:C,attach:"geometry"}),u.createElement("primitive",Y({object:j,attach:"material",color:t,vertexColors:!!s,resolution:[b.width,b.height],linewidth:(m=i??o)!==null&&m!==void 0?m:1,dashed:l,transparent:M===4},v)))});function Ge(){const{progress:a}=Oe();return n.jsx(De,{center:!0,children:n.jsxs("div",{className:"flex flex-col items-center gap-3",children:[n.jsx("div",{className:"w-16 h-16 border-4 border-palace-500 border-t-transparent rounded-full animate-spin"}),n.jsxs("p",{className:"text-palace-600 font-medium",children:["加载中 ",a.toFixed(0),"%"]})]})})}const re={fu:{name:"平安福",meaning:"福气满满，平安喜乐",difficulty:"easy",paths:[[new c(-2,-2),new c(-2,2),new c(2,2),new c(2,-2),new c(-2,-2)],[new c(-1.5,1),new c(-.5,1),new c(-.5,0),new c(-1.5,0)],[new c(0,1),new c(1.5,1),new c(1.5,-1),new c(0,-1),new c(0,1)]]},xi:{name:"双喜",meaning:"喜事连连，好事成双",difficulty:"medium",paths:[[new c(-2,2),new c(-2,-2),new c(-1,-2),new c(-1,0),new c(-.3,0),new c(-.3,2)],[new c(.3,2),new c(.3,0),new c(1,0),new c(1,-2),new c(2,-2),new c(2,2)]]},flower:{name:"窗花",meaning:"花开富贵，春意盎然",difficulty:"hard",paths:[...Array.from({length:8}).map((a,e)=>{const t=e/8*Math.PI*2,s=(e+1)/8*Math.PI*2;return[new c(0,0),new c(Math.cos(t)*2,Math.sin(t)*2),new c(Math.cos((t+s)/2)*1.2,Math.sin((t+s)/2)*1.2)]})]}};function We({path:a,cutProgress:e,isActive:t}){const s=a.map(r=>[r.x,r.y,0]),i=Math.floor(e*s.length)+1,o=s.slice(0,Math.max(2,i));return n.jsxs("group",{children:[n.jsx(ae,{points:s,color:t?"#A73A36":"#cccccc",lineWidth:2,dashed:!0,dashSize:.1,gapSize:.05}),e>0&&o.length>=2&&n.jsx(ae,{points:o,color:"#A73A36",lineWidth:4})]})}function Fe(){return n.jsxs("mesh",{position:[0,0,-.1],children:[n.jsx("planeGeometry",{args:[5,5]}),n.jsx("meshStandardMaterial",{color:"#C41E3A",roughness:.8,metalness:0})]})}function Ve({position:a}){const e=u.useRef(null);return le(t=>{if(e.current){const s=Math.sin(t.clock.elapsedTime*5)*.2;e.current.children[0].rotation.z=s,e.current.children[1].rotation.z=-s}}),n.jsxs("group",{ref:e,position:a,scale:.3,children:[n.jsxs("mesh",{position:[0,.3,.1],children:[n.jsx("boxGeometry",{args:[.1,1,.02]}),n.jsx("meshStandardMaterial",{color:"#666666",metalness:.8,roughness:.3})]}),n.jsxs("mesh",{position:[0,.3,.1],children:[n.jsx("boxGeometry",{args:[.1,1,.02]}),n.jsx("meshStandardMaterial",{color:"#666666",metalness:.8,roughness:.3})]}),n.jsxs("mesh",{position:[0,-.3,.1],children:[n.jsx("torusGeometry",{args:[.2,.05,8,16,Math.PI]}),n.jsx("meshStandardMaterial",{color:"#A73A36",roughness:.5})]})]})}function ke({isComplete:a}){const e=u.useRef(null);return le(t=>{e.current&&a&&(e.current.rotation.z=t.clock.elapsedTime,e.current.scale.setScalar(1+Math.sin(t.clock.elapsedTime*2)*.1))}),a?n.jsxs("mesh",{ref:e,position:[0,0,.05],children:[n.jsx("ringGeometry",{args:[2.2,2.5,32]}),n.jsx("meshBasicMaterial",{color:"#F2D974",transparent:!0,opacity:.6})]}):null}function qe({pattern:a,pathProgress:e,currentPathIndex:t,isComplete:s,scissorPos:i}){return n.jsxs(n.Fragment,{children:[n.jsx(Be,{makeDefault:!0,position:[0,0,6],fov:45}),n.jsx("ambientLight",{intensity:.6}),n.jsx("directionalLight",{position:[5,5,5],intensity:.8}),n.jsx("pointLight",{position:[-3,3,3],intensity:.4,color:"#F2D974"}),n.jsx(Fe,{}),a.paths.map((o,r)=>n.jsx(We,{path:o,cutProgress:e[r]||0,isActive:r===t},r)),n.jsx(Ve,{position:i}),n.jsx(ke,{isComplete:s}),n.jsx(Se,{enablePan:!1,enableZoom:!1,enableRotate:!1})]})}function $e({pattern:a,patternKey:e,isSelected:t,onSelect:s}){const i={easy:"bg-nature-500",medium:"bg-gold-500",hard:"bg-palace-500"},o={easy:"简单",medium:"中等",hard:"困难"};return n.jsxs("button",{onClick:s,className:`p-4 rounded-xl border-2 transition-all ${t?"border-palace-500 bg-palace-50":"border-paper-600 bg-white hover:border-palace-300"}`,children:[n.jsx("div",{className:"w-16 h-16 mx-auto mb-2 bg-palace-500 rounded-lg flex items-center justify-center",children:n.jsx("span",{className:"text-2xl text-white font-bold",children:e==="fu"?"福":e==="xi"?"囍":"❀"})}),n.jsx("p",{className:"font-bold text-mountain-800",children:a.name}),n.jsx("span",{className:`inline-block px-2 py-0.5 rounded text-xs text-white mt-1 ${i[a.difficulty]}`,children:o[a.difficulty]})]})}function ot(){const[a,e]=u.useState("fu"),[t,s]=u.useState("select"),[i,o]=u.useState(0),[r,l]=u.useState([]),[v,y]=u.useState(new S(0,0,.2)),[w,m]=u.useState(!1),b=u.useRef(null),h=re[a];u.useEffect(()=>{h&&l(new Array(h.paths.length).fill(0))},[a,h]);const j=u.useCallback((d,B)=>{if(t!=="playing")return;const X=b.current;if(!X)return;const T=X.getBoundingClientRect(),he=(d-T.left)/T.width*2-1,pe=-((B-T.top)/T.height)*2+1;y(new S(he*3,pe*3,.2)),l(xe=>{const O=[...xe];return O[i]<1&&(O[i]=Math.min(1,O[i]+.02),O[i]>=1&&(i<h.paths.length-1?o(i+1):(s("complete"),setTimeout(()=>m(!0),1e3)))),O})},[t,i,h]),M=d=>{d.buttons===1&&j(d.clientX,d.clientY)},C=d=>{j(d.touches[0].clientX,d.touches[0].clientY)},L=()=>{s("playing"),o(0),l(new Array(h.paths.length).fill(0))},N=()=>{s("select"),o(0),l([]),m(!1)},f=r.length>0?r.reduce((d,B)=>d+B,0)/r.length:0;return n.jsxs("div",{className:"relative w-full h-screen bg-gradient-to-b from-paper-500 to-paper-300",children:[n.jsx(J,{children:t==="select"&&n.jsx(D.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"absolute inset-0 z-20 flex items-center justify-center bg-paper-500/95",children:n.jsxs("div",{className:"max-w-md mx-4 text-center",children:[n.jsx(ve,{className:"w-16 h-16 mx-auto mb-4 text-palace-500"}),n.jsx("h2",{className:"text-2xl font-bold text-mountain-800 mb-2",children:"陕北剪纸艺术"}),n.jsx("p",{className:"text-mountain-500 mb-6",children:"选择一个图案，体验传统剪纸的魅力"}),n.jsx("div",{className:"grid grid-cols-3 gap-4 mb-6",children:Object.entries(re).map(([d,B])=>n.jsx($e,{patternKey:d,pattern:B,isSelected:a===d,onSelect:()=>e(d)},d))}),n.jsx("div",{className:"bg-palace-50 rounded-xl p-4 mb-6",children:n.jsxs("p",{className:"text-sm text-palace-700",children:[n.jsx("strong",{children:h.name}),"：",h.meaning]})}),n.jsxs(ee,{variant:"heritage",size:"lg",onClick:L,className:"w-full",children:[n.jsx(Ne,{className:"w-5 h-5 mr-2"}),"开始剪纸"]})]})})}),n.jsx("div",{ref:b,className:"absolute inset-0",onMouseMove:M,onTouchMove:C,children:n.jsx(be,{children:n.jsx(u.Suspense,{fallback:n.jsx(Ge,{}),children:n.jsx(qe,{pattern:h,pathProgress:r,currentPathIndex:i,isComplete:t==="complete",scissorPos:v})})})}),t!=="select"&&n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-mountain-900/80 to-transparent z-10",children:n.jsxs("div",{className:"max-w-lg mx-auto",children:[n.jsxs("div",{className:"flex items-center justify-between text-white mb-2",children:[n.jsxs("div",{children:[n.jsx("h2",{className:"text-xl font-bold",children:h.name}),n.jsxs("p",{className:"text-sm text-white/70",children:["第 ",i+1," / ",h.paths.length," 条剪裁线"]})]}),n.jsx("button",{onClick:N,className:"p-2 rounded-full bg-white/10 hover:bg-white/20",children:n.jsx(ze,{className:"w-5 h-5"})})]}),n.jsx("div",{className:"w-full bg-paper-600 rounded-full h-3 overflow-hidden",children:n.jsx(D.div,{className:"h-full bg-gradient-to-r from-palace-500 to-gold-500 rounded-full",animate:{width:`${f*100}%`}})})]})}),t==="playing"&&n.jsx("div",{className:"absolute bottom-20 left-1/2 -translate-x-1/2 z-10",children:n.jsxs(D.div,{animate:{opacity:[.6,1,.6]},transition:{duration:2,repeat:1/0},className:"flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full text-mountain-600",children:[n.jsx(we,{className:"w-4 h-4"}),n.jsx("span",{className:"text-sm",children:"沿虚线滑动剪裁"})]})})]}),n.jsx(J,{children:w&&n.jsx(D.div,{initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.8},className:"absolute inset-0 flex items-center justify-center bg-black/60 z-50",children:n.jsxs("div",{className:"bg-white rounded-3xl p-8 max-w-sm mx-4 text-center",children:[n.jsx(D.div,{animate:{rotate:[0,10,-10,0],scale:[1,1.1,1]},transition:{duration:.5,repeat:2},children:n.jsx("div",{className:"w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-palace-400 to-palace-600 rounded-2xl flex items-center justify-center shadow-lg",children:n.jsx(Te,{className:"w-10 h-10 text-white"})})}),n.jsx("h3",{className:"text-2xl font-bold text-mountain-800 mb-2",children:"✂️ 剪纸完成！"}),n.jsx("p",{className:"text-mountain-500 mb-4",children:"恭喜获得文脉碎片"}),n.jsx("div",{className:"bg-paper-500 rounded-xl p-4 mb-6",children:n.jsxs("div",{className:"flex items-center gap-3",children:[n.jsx("div",{className:"w-12 h-12 bg-palace-500 rounded-lg flex items-center justify-center text-white text-xl font-bold",children:a==="fu"?"福":a==="xi"?"囍":"❀"}),n.jsxs("div",{className:"text-left",children:[n.jsxs("p",{className:"font-bold text-mountain-800",children:[h.name,"剪纸"]}),n.jsx("p",{className:"text-xs text-mountain-500",children:"稀有度: 精品"})]})]})}),n.jsxs(ee,{variant:"heritage",className:"w-full",onClick:N,children:[n.jsx(Pe,{className:"w-4 h-4 mr-2"}),"继续探索"]})]})})})]})}export{ot as default};
