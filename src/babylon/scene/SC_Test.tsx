"use client"
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import SceneContainer from "../SceneContainer";
import Logo from "../object/Logo";
import "./SC_Fixed.css"
import { Engine, ILoadedModel, Model, Scene, useScene } from "react-babylonjs";
import { AbstractMesh, Color4, Vector3, Animation } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { observable } from "@legendapp/state";
function animation_y(position: Vector3, offsetY: number) {
	const { y } = position
	const keys = [
		{
			frame: 0,
			value: y + offsetY,
		},
		{
			frame: 60,
			value: y,

		},
		{
			frame: 120,
			value: y + offsetY,

		},
	]
	const animation = new Animation('animation', 'position.y', 60, 0, 1)
	animation.setKeys(keys)
	return [animation]

}

const Ypos$ = observable(0);
const scene$ = observable();

export default function SC_Test() {
	const [scrollY, setScrollY] = useState(0);
	const scene = useScene();
	let baseUrl = '/glb/';
	const modelRef = useRef<AbstractMesh | null>(null)
	let moveBackAnime: any;
	const onModelLoaded = (model: ILoadedModel) => {
		modelRef.current = model.rootMesh!
		const moveBack = modelRef.current.getScene().getAnimationGroupByName("moveBack");
		if (moveBack) {
			moveBack.stop();
		}
		moveBackAnime = moveBack;

	}


	useEffect(() => {

		if (scene$ != null) {
		}
		if (modelRef.current) {
		}
	}, [])


	const handleScroll = () => {
		Ypos$.set(window.scrollY);
	};
	Ypos$.onChange(() => {
		const my = modelRef.current?.getScene().getAnimationGroupByName("moveBack");
		my?.play();
	})

	//scroll Event
	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []); // Empty dependency array ensures the effect runs only once when the component mounts

	useEffect(() => {
		console.log(scrollY);

	}, [scrollY])


	return (
		<div>
			<div style={{ display: 'flex bg-transparent' }} >
				<Engine antialias adaptToDeviceRatio canvasId="babylon-canvas" renderOptions={{
					whenVisibleOnly: true,
				}} >
					<Scene
						clearColor={new Color4(0, 0, 0, 0)}>

						<freeCamera
							name="camera1"
							position={new Vector3(0, 5, -10)}
							setTarget={[Vector3.Zero()]}
						/>

						<hemisphericLight
							name="light1"
							intensity={1}
							direction={new Vector3(0, 1, 0)}
						/>

						<Suspense fallback={<box name="fallback" position={new Vector3(0, 0, 0)} />}>
							<Model
								name="monekey"
								rootUrl={`${baseUrl}`}
								sceneFilename={'monkey.glb'}
								scaleToDimension={1}
								position={new Vector3(0, 0, 0)}
								onModelLoaded={onModelLoaded}
								rotation={new Vector3(0, 0, 0)}
								scaling={new Vector3(0.5, 0.5, 0.5)}
							/>
						</Suspense >

					</Scene>
				</Engine>
			</div >

		</div>
	)
}
