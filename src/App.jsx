import { Loader, PositionalAudio, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App() {
  return (
    <>
      {/* <Stats /> */}
      <UI />
      <Loader />
      <Canvas shadows camera={{ position: [0, 0.5, 10], fov: 50 }}>
        <color attach="background" args={["#111"]} />
        <Suspense>
          <Physics colliders={false}>
            <Experience />
          </Physics>
        </Suspense>
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.3} luminanceThreshold={1.5} />
        </EffectComposer>
        <Preloader />
      </Canvas>
    </>
  );
}

export const AUDIOS = {
  pop: "sfxs/balloon-pop-48030.mp3",
  impact: "sfxs/cinematic-hit-159487-cut.mp3",
  throw: "sfxs/axe-slash-1-106748-cut.mp3",
};

const Preloader = () => {
  return Object.values(AUDIOS).map((audio) => (
    <PositionalAudio key={audio} url={audio} loop={false} autoplay={false} />
  ));
};

useGLTF.preload("models/balloon_modified.glb");
useGLTF.preload("models/Axe Small Applied.glb");
useGLTF.preload("models/Axe Small.glb");
useGLTF.preload("models/AncientRuins-v1.glb");
useGLTF.preload("models/Ancient Ruins target.glb");

export default App;
