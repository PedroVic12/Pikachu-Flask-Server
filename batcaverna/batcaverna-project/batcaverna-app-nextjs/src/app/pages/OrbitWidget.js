"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SOLAR_SYSTEM_DATA = new Map([
  ['sun', { name: 'Sol', radius: 4.5, color: 0xffcc33, isStar: true }],
  ['earth', { name: 'Terra', radius: 0.8, color: 0x2288ff, orbit: { radius: 25.0, period: 365 } }],
  ['mars', { name: 'Marte', radius: 0.45, color: 0xff5733, orbit: { radius: 38.0, period: 687 } }],
  ['moon', { name: 'Lua', radius: 0.25, color: 0xaaaaaa, orbit: { radius: 2.5, period: 27, center: 'earth' } }]
]);

class OrbitalMechanics {
  static calculateSpeed(period, timeScale = 0.005) { if (!period) return 0; return timeScale * (365 / period); }
  static calculatePosition(angle, radius) { const x = Math.cos(angle) * radius; const z = Math.sin(angle) * radius; return new THREE.Vector3(x, 0, z); }
}

function mountPhysicsOrbitSystem(container) {
  if (!container) return { stop: () => { }, setCameraTarget: () => { } };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 40, 70);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 200;

  // Estrelas de fundo
  const starVertices = Array.from({ length: 15000 }, () => THREE.MathUtils.randFloatSpread(2000));
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const celestialObjects = new Map();
  const orbitalStates = new Map();
  SOLAR_SYSTEM_DATA.forEach((data, id) => {
    const material = data.isStar ? new THREE.MeshBasicMaterial({ color: data.color }) : new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.6 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 32, 32), material);
    scene.add(mesh);
    celestialObjects.set(id, mesh);
    if (data.isStar) scene.add(new THREE.PointLight(0xffddaa, 2.5, 1000));
    if (data.orbit) {
      orbitalStates.set(id, { angle: Math.random() * Math.PI * 2, speed: OrbitalMechanics.calculateSpeed(data.orbit.period) });
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, i) => {
          const theta = (i / 128) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(theta) * data.orbit.radius, 0, Math.sin(theta) * data.orbit.radius);
        })),
        new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.4 })
      );
      if (data.orbit.center && celestialObjects.get(data.orbit.center)) celestialObjects.get(data.orbit.center).add(orbitLine);
      else scene.add(orbitLine);
    }
  });
  let running = true;
  let targetObject = celestialObjects.get('sun');
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    orbitalStates.forEach((state, id) => {
      state.angle += state.speed;
      const data = SOLAR_SYSTEM_DATA.get(id);
      const object = celestialObjects.get(id);
      if (data && object) {
        let position = OrbitalMechanics.calculatePosition(state.angle, data.orbit.radius);
        if (data.orbit.center) {
          const centerObject = celestialObjects.get(data.orbit.center);
          if (centerObject) position.add(centerObject.position);
        }
        object.position.copy(position);
      }
    });
    celestialObjects.forEach(obj => { obj.rotation.y += 0.005; });
    if (targetObject) controls.target.lerp(targetObject.position, 0.1);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);
  return {
    stop: () => {
      running = false;
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement && renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    },
    setCameraTarget: (targetName) => {
      const newTarget = celestialObjects.get(targetName);
      if (newTarget) targetObject = newTarget;
    }
  };
}

export const OrbitWidget = () => {
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const [target, setTarget] = useState('sun');

  useEffect(() => {
    if (containerRef.current) {
      simRef.current = mountPhysicsOrbitSystem(containerRef.current);
    }
    return () => {
      if (simRef.current?.stop) simRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (simRef.current?.setCameraTarget) {
      simRef.current.setCameraTarget(target);
    }
  }, [target]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef} 
        className="w-full h-full absolute top-0 left-0"
      ></div>
      
      <div className="absolute top-2 left-2 md:top-4 md:left-4 glass-panel !p-1 md:!p-2 flex gap-1 md:gap-2">
        <button 
          onClick={() => setTarget('sun')} 
          className={`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'sun' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}
        >
          Visão: Sol ☀️
        </button>
        <button 
          onClick={() => setTarget('earth')} 
          className={`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'earth' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}
        >
          Visão: Terra 🌍
        </button>
      </div>
    </div>
  );
};

export default OrbitWidget;
