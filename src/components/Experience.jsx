import {
  CameraControls,
  Environment,
  Gltf,
  Grid,
  PerspectiveCamera,
  PositionalAudio,
  useGLTF,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  ConvexHullCollider,
  CuboidCollider,
  quat,
  RigidBody,
  vec3,
} from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import { degToRad, randFloat } from "three/src/math/MathUtils.js";
import { VFXEmitter, VFXParticles } from "wawa-vfx";
import { AUDIOS } from "../App";
import { balloonMaterials, useGame } from "../hooks/useGame";
import { GradientSky } from "./GradientSky";

export const Experience = () => {
  const { nodes } = useGLTF("models/Axe Small Applied.glb");

  const controls = useRef();
  const axeLaunched = useGame((state) => state.axeLaunched);
  const firstGame = useGame((state) => state.firstGame);
  const throws = useGame((state) => state.throws);
  useEffect(() => {
    if (firstGame) {
      controls.current.setLookAt(-15, -5, 20, 10, 0, 0, true);
    } else if (axeLaunched || throws === 0) {
      if (window.innerWidth < 1024) {
        controls.current.setLookAt(-10, 10, 40, 10, 0, 0, true);
      } else {
        controls.current.setLookAt(10, 0, 30, 10, 0, 0, true);
      }
    } else {
      controls.current.setLookAt(-0.1, 0, 0, 0, 0, 0, true);
    }
  }, [axeLaunched, throws, firstGame]);

  return (
    <>
      <CameraControls
        ref={controls}
        mouseButtons={{
          left: 0,
          middle: 0,
          right: 0,
        }}
        touches={{
          one: 0,
          two: 0,
          three: 0,
        }}
      />
      <VFXEmitter
        emitter="stars"
        settings={{
          duration: 10,
          delay: 0,
          nbParticles: 5000,
          spawnMode: "time",
          loop: true,
          startPositionMin: [-20, -20, -20],
          startPositionMax: [20, 20, 20],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [4, 10],
          speed: [0, 0.2],
          directionMin: [-1, -1, -1],
          directionMax: [1, 1, 1],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["#ffffff", "#b7b0e3", "pink"],
          size: [0.01, 0.05],
        }}
      />
      <Walls />
      <Balloons />
      <AxeController />

      <GradientSky />
      <group position-y={-1} position-x={20}>
        <Target />
      </group>
      <Grid
        position-y={-10}
        infiniteGrid
        sectionColor={"#999"}
        cellColor={"#555"}
        fadeStrength={5}
      />
      <directionalLight
        position={[30, 15, 30]}
        castShadow
        intensity={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.005}
      >
        <PerspectiveCamera
          attach={"shadow-camera"}
          near={10}
          far={50}
          fov={80}
        />
      </directionalLight>
      <Gltf
        src="models/AncientRuins-v1.glb"
        castShadow
        receiveShadow
        scale={3}
        rotation-y={degToRad(-90)}
        position-y={-8}
        position-x={10}
      />
      <Environment preset="sunset" environmentIntensity={0.3} />

      <VFXParticles
        name="stars"
        geometry={<circleGeometry args={[0.1, 20]} />}
        settings={{
          fadeAlpha: [0.5, 0.5],
          fadeSize: [0.5, 0.5],
          gravity: [0, 0.2, 0],
          intensity: 5,
          nbParticles: 5000,
          renderMode: "billboard",
        }}
      />
      <VFXParticles
        name="sparks"
        settings={{
          fadeAlpha: [0, 1],
          fadeSize: [0, 0],
          gravity: [0, -10, 0],
          intensity: 8,
          nbParticles: 100000,
          renderMode: "billboard",
        }}
      />
      <VFXParticles
        name="axes"
        geometry={<primitive object={nodes.Axe_small.geometry} />}
        settings={{
          fadeAlpha: [0, 0],
          fadeSize: [0, 1],
          intensity: 2,
          nbParticles: 200,
          renderMode: "mesh",
        }}
      />
    </>
  );
};

const Target = () => {
  const rb = useRef();

  useFrame(({ clock }) => {
    if (rb.current) {
      rb.current.setTranslation(
        vec3({ x: 20, y: Math.sin(clock.elapsedTime * 2) * 2, z: 0 }),
        true
      );
    }
  });
  return (
    <RigidBody ref={rb} name="target" colliders="hull" type="kinematicPosition">
      <Gltf
        src="models/Ancient Ruins target.glb"
        rotation-y={degToRad(-90)}
        scale={3}
        position-x={0}
        position-y={1}
      />
    </RigidBody>
  );
};

const Walls = () => {
  return (
    <>
      <RigidBody type="fixed" position-z={-1}>
        <CuboidCollider args={[100, 100, 0.1]} />
      </RigidBody>
      <RigidBody type="fixed" position-z={1}>
        <CuboidCollider args={[100, 100, 0.1]} />
      </RigidBody>
    </>
  );
};

const Balloons = () => {
  const balloons = useGame((state) => state.balloons);

  return balloons.map((balloon) => <Balloon key={balloon.id} {...balloon} />);
};

const Balloon = ({ position, color }) => {
  const { nodes, materials } = useGLTF("models/balloon_modified.glb");
  const rb = useRef();

  useEffect(() => {
    if (rb.current) {
      rb.current.applyTorqueImpulse(
        {
          x: Math.random() * 0.05,
          y: Math.random() * 0.05,
          z: Math.random() * 0.05,
        },
        true
      );
    }
  }, []);

  useFrame(() => {
    if (rb.current && !exploded) {
      const curTranslation = rb.current.translation();
      if (curTranslation.y > 20) {
        curTranslation.y = randFloat(-20, -15);
        rb.current.setLinvel({
          x: 0,
          y: 0,
          z: 0,
        });
        rb.current.setAngvel({
          x: 0,
          y: 0,
          z: 0,
        });
        rb.current.applyTorqueImpulse(
          {
            x: Math.random() * 0.05,
            y: Math.random() * 0.05,
            z: Math.random() * 0.05,
          },
          true
        );
      }
      rb.current.setTranslation(curTranslation, true);
    }
  });
  const [exploded, setExploded] = useState(false);
  const onBalloonHit = useGame((state) => state.onBalloonHit);
  useEffect(() => {
    if (exploded) {
      onBalloonHit();
    }
  }, [exploded]);

  const onIntersectionEnter = useCallback((e) => {
    if (e.other.rigidBodyObject.name === "axe") {
      setExploded(true);
      // console.log("hit", e);
    }
  }, []);

  return (
    <RigidBody
      type="dynamic"
      position={position}
      ref={rb}
      gravityScale={-0.1}
      mass={0.1}
      linearDamping={0.2}
      angularDamping={0.2}
      restitution={1}
      onIntersectionEnter={onIntersectionEnter}
    >
      {exploded && (
        <>
          <PositionalAudio
            url={AUDIOS.pop}
            autoplay
            loop={false}
            distance={10}
          />
          <VFXEmitter
            emitter="sparks"
            settings={{
              loop: false,
              spawnMode: "burst",
              nbParticles: 100,
              duration: 1,
              size: [0.05, 0.3],
              startPositionMin: [-0.1, -0.1, -0.1],
              startPositionMax: [0.1, 0.1, 0.1],
              directionMin: [-0.1, 0, -0.1],
              directionMax: [0.1, 0.5, 0.1],
              rotationSpeedMin: [-1, -1, -10],
              rotationSpeedMax: [1, 1, 10],
              speed: [1, 7],
              colorStart: [color],
              particlesLifetime: [0.1, 1],
            }}
          />
        </>
      )}
      <group dispose={null} visible={!exploded} scale={3}>
        <ConvexHullCollider
          args={[nodes.Balloon.geometry.attributes.position.array]}
        />
        <mesh
          geometry={nodes.Balloon.geometry}
          material={balloonMaterials[color]}
        />
        <mesh geometry={nodes.Logo.geometry} material={materials.Logo} />
        <mesh
          geometry={nodes.String.geometry}
          material={balloonMaterials[color]}
        />
      </group>
    </RigidBody>
  );
};

const AxeController = ({ ...props }) => {
  const rb = useRef();

  const axeLaunched = useGame((state) => state.axeLaunched);
  const launchAxe = useGame((state) => state.launchAxe);

  useEffect(() => {
    const onPointerUp = () => {
      launchAxe();
    };
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);
  const [impact, setImpact] = useState(false);
  const onTargetHit = useGame((state) => state.onTargetHit);

  useEffect(() => {
    if (impact) {
      onTargetHit();
    }
  }, [impact]);

  useEffect(() => {
    if (axeLaunched) {
      rb.current.setBodyType(0); // 0 = dynamic
      rb.current.setLinvel({ x: 0, y: 0, z: 0 });
      rb.current.setAngvel({ x: 0, y: 0, z: 0 });
      rb.current.applyImpulse({ x: 1, y: 0.5, z: 0 }, true);
      rb.current.applyTorqueImpulse({ x: 0, y: 0, z: -0.2 }, true);
      sfxThrow.current.play();
    } else {
      setImpact(false);
    }
  }, [axeLaunched]);

  const sfxThrow = useRef();
  const sfxHit = useRef();

  useFrame(({ pointer, viewport }, delta) => {
    if (!axeLaunched && rb.current) {
      rb.current.setRotation(quat(0, 0, 0, 1), true);
      rb.current.setTranslation({
        x: 1,
        y: -0.2 + pointer.y * 0.5,
        z: pointer.x * 0.5,
      });

      rb.current.setLinvel({ x: 0, y: 0, z: 0 });
      rb.current.setAngvel({ x: 0, y: 0, z: 0 });
    }
  });

  return (
    <group {...props}>
      <PositionalAudio
        url={AUDIOS.impact}
        autoplay={false}
        ref={sfxHit}
        loop={false}
        distance={10}
      />
      {impact && (
        <group position={[impact.x, impact.y, impact.z]}>
          <VFXEmitter
            emitter="sparks"
            settings={{
              spawnMode: "burst",
              nbParticles: 8000,
              duration: 1,
              size: [0.01, 0.62],
              startPositionMin: [0, 0, 0],
              startPositionMax: [0, 0, 0],
              directionMin: [-1, -1, -1],
              directionMax: [1, 1, 1],
              rotationSpeedMin: [-1, -1, -10],
              rotationSpeedMax: [1, 1, 10],
              speed: [0.1, 10],
              particlesLifetime: [0.1, 1],
              colorStart: ["orange", "orangered"],
            }}
          />
        </group>
      )}
      <RigidBody
        ref={rb}
        position-x={0}
        name="axe"
        type={"kinematicPosition"}
        colliders="hull"
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject.name === "target") {
            rb.current.setBodyType(2); // 2 = "kinematicPosition"
            rb.current.setLinvel({ x: 0, y: 0, z: 0 });
            rb.current.setAngvel({ x: 0, y: 0, z: 0 });
            setImpact(rb.current.translation());
            sfxHit.current.stop();
            sfxHit.current.play();
          }
        }}
      >
        <PositionalAudio
          ref={sfxThrow}
          autoplay={false}
          url={AUDIOS.throw}
          loop={false}
          distance={50}
        />
        <Gltf src="models/Axe Small.glb" position-y={-0.3} />

        {axeLaunched && !impact && (
          <group>
            <VFXEmitter
              position-y={-0.3}
              emitter="axes"
              settings={{
                loop: true,
                spawnMode: "time",
                nbParticles: 80,
                particlesLifetime: [1, 1],
                duration: 0.5,
                size: [1, 1],
                startPositionMin: [0, 0, 0],
                startPositionMax: [0, 0, 0],
                directionMin: [0, 0, 0],
                directionMax: [0, 0, 0],
                startRotationMin: [0, 0, 0],
                startRotationMax: [0, 0, 0],
                speed: [0.1, 2],
                colorStart: ["#424242"],
              }}
            />
          </group>
        )}
      </RigidBody>
    </group>
  );
};
