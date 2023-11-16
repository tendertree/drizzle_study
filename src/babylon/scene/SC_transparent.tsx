"use client"
import { ReactNode } from "react";
import SceneContainer from "../SceneContainer";
import Logo from "../object/Logo";
import "./SC_transparent.css"






export default function SC_transparent({ children }: { children: ReactNode }) {
	return (
		<div>
			<SceneContainer>
				{children}
			</SceneContainer>
		</div>
	)
}
