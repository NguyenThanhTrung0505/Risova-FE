import { useEffect, useRef, useState } from 'react';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color;
  uniform vec3 u_glowColor;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_sparkFrequency;
  uniform float u_chaos;
  uniform float u_phase;

  varying vec2 v_uv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 texel = 1.0 / max(u_resolution, vec2(1.0));
    float t = u_time * u_speed + u_phase;

    vec4 baseSample = texture2D(u_texture, v_uv);
    float baseAlpha = baseSample.a;

    // Sample neighborhood to build contour edge field and soft outer aura
    float aN = texture2D(u_texture, v_uv + vec2(0.0, -texel.y * 1.8)).a;
    float aS = texture2D(u_texture, v_uv + vec2(0.0,  texel.y * 1.8)).a;
    float aE = texture2D(u_texture, v_uv + vec2( texel.x * 1.8, 0.0)).a;
    float aW = texture2D(u_texture, v_uv + vec2(-texel.x * 1.8, 0.0)).a;

    float aNE = texture2D(u_texture, v_uv + vec2( texel.x * 3.5, -texel.y * 3.5)).a;
    float aNW = texture2D(u_texture, v_uv + vec2(-texel.x * 3.5, -texel.y * 3.5)).a;
    float aSE = texture2D(u_texture, v_uv + vec2( texel.x * 3.5,  texel.y * 3.5)).a;
    float aSW = texture2D(u_texture, v_uv + vec2(-texel.x * 3.5,  texel.y * 3.5)).a;

    float aOuterN = texture2D(u_texture, v_uv + vec2(0.0, -texel.y * 6.5)).a;
    float aOuterS = texture2D(u_texture, v_uv + vec2(0.0,  texel.y * 6.5)).a;
    float aOuterE = texture2D(u_texture, v_uv + vec2( texel.x * 6.5, 0.0)).a;
    float aOuterW = texture2D(u_texture, v_uv + vec2(-texel.x * 6.5, 0.0)).a;

    float nearGlow = (aN + aS + aE + aW + baseAlpha) * 0.2;
    float midGlow = (aNE + aNW + aSE + aSW) * 0.25;
    float farGlow = (aOuterN + aOuterS + aOuterE + aOuterW) * 0.25;

    // Edge contour detection (highlights strokes and gear tooth boundaries)
    float grad = abs(aE - aW) + abs(aN - aS);
    float contour = clamp(grad * 1.15 + baseAlpha * 0.65, 0.0, 1.0);

    // Subtle organic distortion for the electric plasma filament
    vec2 warpedUv = v_uv * 4.5;
    float fieldNoise = fbm(warpedUv + vec2(t * 0.45, -t * 0.32));
    float fineNoise = fbm(v_uv * 11.0 - vec2(t * 0.9, t * 0.65));

    // Slow traveling electric pulse wave sweeping along the gear shape
    float angle = atan(v_uv.y - 0.5, v_uv.x - 0.5);
    float travelWave = sin(angle * 2.0 - t * 1.45 + fieldNoise * (4.0 * u_chaos + 2.0));
    float currentBand = smoothstep(0.15, 0.92, travelWave * 0.5 + 0.5);

    // Secondary slower counter-wave for subtle continuity
    float counterWave = sin(angle * 3.0 + t * 0.85 - fineNoise * 3.0);
    float secondaryBand = smoothstep(0.45, 0.98, counterWave * 0.5 + 0.5) * 0.45;

    // Electric filament clinging along distorted gear edges
    vec2 jitter = (vec2(fieldNoise, fineNoise) - 0.5) * texel * (6.0 * u_chaos + 2.5);
    float jitterAlpha = texture2D(u_texture, clamp(v_uv + jitter, 0.0, 1.0)).a;
    float electricEdge = clamp(abs(jitterAlpha - baseAlpha) * 2.4 + contour * currentBand, 0.0, 1.0);

    // Occasional tiny electric sparks flickering on gear teeth/edges
    float sparkBucket = floor(t * 2.6);
    float sparkSeed = hash(vec2(sparkBucket, u_phase + 13.7));
    float sparkGate = smoothstep(1.0 - u_sparkFrequency, 1.0, sparkSeed);
    float sparkPulse = pow(max(0.0, sin(fract(t * 2.6) * 3.14159)), 2.0);
    float sparkSpot = smoothstep(0.76, 0.93, fbm(v_uv * 16.0 + vec2(sparkBucket * 3.17, -sparkBucket * 1.93)));
    float spark = sparkGate * sparkPulse * sparkSpot * clamp(nearGlow * 1.4 + midGlow * 0.8, 0.0, 1.0);

    // Compose technical blueprint base + soft pale-blue electricity + subtle halo
    vec3 blueprintCol = baseSample.rgb * (0.72 + 0.16 * currentBand);
    vec3 electricCol = u_color * (electricEdge * (0.42 + 0.48 * currentBand + secondaryBand) * u_intensity);
    vec3 auraCol = u_glowColor * ((midGlow * 0.28 + farGlow * 0.14) * (0.45 + 0.55 * currentBand) * u_intensity);
    vec3 sparkCol = mix(u_color, vec3(0.92, 0.98, 1.0), 0.72) * (spark * 1.15 * u_intensity);

    vec3 finalRgb = blueprintCol * baseAlpha + electricCol + auraCol + sparkCol;
    float finalAlpha = clamp(
      baseAlpha * 0.78 +
      electricEdge * 0.34 * u_intensity +
      (midGlow * 0.22 + farGlow * 0.12) * u_intensity +
      spark * 0.72,
      0.0,
      1.0
    );

    if (finalAlpha < 0.004) discard;
    gl_FragColor = vec4(finalRgb / max(finalAlpha, 0.004), finalAlpha);
  }
`;

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const int = parseInt(full, 16);
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ElectricLogo({
  src,
  alt = '',
  color = '#8fd3ff',
  glowColor = '#4fa8e8',
  speed = 0.42,
  intensity = 0.72,
  sparkFrequency = 0.34,
  chaos = 0.26,
  phaseOffset = 0,
  disabled = false,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  const shouldFallback = disabled || reducedMotion || webglFailed;

  useEffect(() => {
    if (shouldFallback || !src) return undefined;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglFailed(true);
      return undefined;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) {
      if (vert) gl.deleteShader(vert);
      if (frag) gl.deleteShader(frag);
      setWebglFailed(true);
      return undefined;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglFailed(true);
      return undefined;
    }

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uniforms = {
      u_texture: gl.getUniformLocation(program, 'u_texture'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_color: gl.getUniformLocation(program, 'u_color'),
      u_glowColor: gl.getUniformLocation(program, 'u_glowColor'),
      u_speed: gl.getUniformLocation(program, 'u_speed'),
      u_intensity: gl.getUniformLocation(program, 'u_intensity'),
      u_sparkFrequency: gl.getUniformLocation(program, 'u_sparkFrequency'),
      u_chaos: gl.getUniformLocation(program, 'u_chaos'),
      u_phase: gl.getUniformLocation(program, 'u_phase'),
    };

    const rgbColor = hexToRgb(color);
    const rgbGlow = hexToRgb(glowColor);

    let disposed = false;
    let textureReady = false;
    let isInView = true;
    let rafId = 0;
    const startTime = performance.now();

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(64, Math.round(rect.width * dpr));
      const height = Math.max(64, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    syncSize();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (disposed) return;
      const texSize = 512;
      const offscreen = document.createElement('canvas');
      offscreen.width = texSize;
      offscreen.height = texSize;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, texSize, texSize);
      ctx.drawImage(img, 0, 0, texSize, texSize);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
      textureReady = true;
    };
    img.onerror = () => {
      if (!disposed) setWebglFailed(true);
    };
    img.src = src;

    const handleContextLost = (event) => {
      event.preventDefault();
      if (!disposed) setWebglFailed(true);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { if (!disposed) syncSize(); })
      : null;
    resizeObserver?.observe(container);

    const intersectionObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { isInView = entry.isIntersecting; })
      : null;
    intersectionObserver?.observe(container);

    const render = (now) => {
      if (disposed) return;
      if (textureReady && isInView && document.visibilityState !== 'hidden') {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.u_texture, 0);
        gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.u_time, (now - startTime) * 0.001);
        gl.uniform3f(uniforms.u_color, rgbColor[0], rgbColor[1], rgbColor[2]);
        gl.uniform3f(uniforms.u_glowColor, rgbGlow[0], rgbGlow[1], rgbGlow[2]);
        gl.uniform1f(uniforms.u_speed, speed);
        gl.uniform1f(uniforms.u_intensity, intensity);
        gl.uniform1f(uniforms.u_sparkFrequency, sparkFrequency);
        gl.uniform1f(uniforms.u_chaos, chaos);
        gl.uniform1f(uniforms.u_phase, phaseOffset);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [shouldFallback, src, color, glowColor, speed, intensity, sparkFrequency, chaos, phaseOffset]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
      aria-hidden="true"
    >
      {shouldFallback ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.72,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
}
