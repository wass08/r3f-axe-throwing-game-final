import { useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { MathUtils, MeshStandardMaterial } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useMemo } from "react";
import { BALLOON_COLORS } from "../hooks/useGame";

extend({ InstancedMesh2 });

export const Balloons = ({ count = 50, rand = MathUtils.randFloatSpread, randFloat = MathUtils.randFloat }) => {
  const instancedMeshRef = useRef();
  const { rapier, world } = useRapier();
  const { nodes, materials } = useGLTF("./models/balloon_modified.glb");
  const material = useMemo(() => new MeshStandardMaterial({ color: 0xffffff }), []);
  


  const geometry = nodes.Balloon.geometry
  const vertices = nodes.Balloon.geometry.attributes.position.array
  
  // to remove rigidBody, do not rely on React renderer, instead
  // use the world from useRapier()
  // world.removeRigidBody(instance.rigidBody);
  // instance.remove()
  // 
  // a lot more efficient and avoids React re-renders, which we don't want in a 3D world

  useEffect(() => {
    if (
      !instancedMeshRef.current ||
      !rapier ||
      !world ||
      !nodes?.Balloon

    ) return;

    // instancedMeshRef.current.computeBVH();

    const scaleFactor = 3;
    
    const scaledVertices = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 3) {
      scaledVertices[i] = vertices[i] * scaleFactor;
      scaledVertices[i + 1] = vertices[i + 1] * scaleFactor;
      scaledVertices[i + 2] = vertices[i + 2] * scaleFactor;
    }
  
    const singleColliderDesc = rapier.ColliderDesc
      .convexHull(scaledVertices)
      .setRestitution(1.0);
    

    setTimeout(() => {
      instancedMeshRef.current.addInstances(count, (obj, i) => {
        const x = randFloat(8, 18);
        const y = randFloat(-20, 0);
        const z = rand(1);

        obj.position.set(x, y, z);
        obj.hasBeenRotated = false;
        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // obj.quaternion.random();

        const rigidBodyDesc = rapier.RigidBodyDesc
          .dynamic()
          .setTranslation(x, y, z)
          .setGravityScale(-0.1)
          .setLinearDamping(0.2)
          .setAngularDamping(0.2);
;
        const rigidBody = world.createRigidBody(rigidBodyDesc);

        world.createCollider(singleColliderDesc, rigidBody);

        rigidBody.applyTorqueImpulse(
          {
            x: Math.random() * 0.05,
            y: Math.random() * 0.05,
            z: Math.random() * 0.05,
          },
          true
        );
        rigidBody.name = "balloon"
        obj.color = BALLOON_COLORS[i % BALLOON_COLORS.length];
        obj.rigidBody = rigidBody;
      });
    }, 1000);
  }, [count, rand, rapier, world, nodes, materials]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!instancedMeshRef.current && time < 1) return;

    instancedMeshRef.current.updateInstances((instance, i) => {
      if (instance?.rigidBody) {
        const rigidBody = instance.rigidBody;
        const pos = rigidBody.translation();
        const rot = rigidBody.rotation();
        instance.position.set(pos.x, pos.y, pos.z);
        instance.quaternion.set(rot.x, rot.y, rot.z, rot.w);
        instance.updateMatrix();

        if(pos.y > 22){
          
          rigidBody.setTranslation({x: pos.x, y: randFloat(-20, -15), z: pos.z});
          rigidBody.setLinvel({x: 0, y: 0, z: 0});
          rigidBody.setAngvel({x: 0, y: 0, z: 0});
          if(!instance.hasBeenRotated){
            rigidBody.applyTorqueImpulse(
              {
                x: Math.random() * 0.0005,
                y: Math.random() * 0.0005,
                z: Math.random() * 0.0005,
              },
              true
            );
            instance.hasBeenRotated = true;
          }
        }
        if (pos.x > 17.5) {
          rigidBody.setLinvel({ x: -0.5, y: pos.y, z: pos.z });
        }
        if (pos.x < 8.5) {
          rigidBody.setLinvel({ x: 0.5, y: pos.y, z: pos.z });
        }
        if(!rigidBody.isEnabled()){
          instance.remove();
        }
      }
    });
  });

  return (
    <instancedMesh2
      ref={instancedMeshRef}
      frustumCulled={false}
      args={[
        geometry,
        material,
        { createEntities: true },
      ]}
      castShadow
      receiveShadow
    />
  );
};
