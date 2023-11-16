import { ArcRotateCamera, Color4, Vector3 } from '@babylonjs/core'
import { FC, ReactNode, RefObject, useEffect, useRef } from 'react';
import { Engine, Scene, Camera, useScene, useCanvas, } from 'react-babylonjs'


//const SC_isometric: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => (


export default function SC_isometric({ children }: { children: ReactNode }) {
	const scene = useScene();
	if (scene != null && scene.activeCamera != null) {
		scene.activeCamera.inputs.removeByType('ArcRotateCameraPointersInput');
	}

	return (
		<div style={{ flex: 1, display: 'flex bg-transparent' }}>
			<Engine antialias adaptToDeviceRatio canvasId="babylon-canvas" renderOptions={{
				whenVisibleOnly: true,
			}} >
				<Scene
					clearColor={new Color4(0, 0, 0, 0)}>
					<arcRotateCamera
						radius={4}
						name="camera1"
						alpha={Math.PI / 4}  // Slightly rotate around the Y-axis
						beta={Math.PI / 6}   // Slightly rotate above the XZ plane
						target={Vector3.Zero()}
						lowerRadiusLimit={10}
						upperRadiusLimit={10}
						lowerBetaLimit={Math.PI / 5}  // Fixed angle above the XZ plane
						upperBetaLimit={Math.PI / 5 + 0.5}
						lowerAlphaLimit={Math.PI / 4 - 0.1}  // Adjust the lower limit for XZ rotation
						upperAlphaLimit={Math.PI / 4 + 0.1}  // Adjust the upper limit for XZ rotatio
					/>


					<hemisphericLight
						name="light1"
						intensity={1}
						direction={new Vector3(0, 1, 0)}
					/>

					{children}
				</Scene>
			</Engine>
		</div >
	)
}

