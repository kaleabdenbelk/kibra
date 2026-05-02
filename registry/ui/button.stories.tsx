import React from "react";
import { View } from "react-native";
import { Button } from "./button";

export default {
	title: "Components/Button",
	component: Button,
};

export const Default = () => (
	<View style={{ padding: 20 }}>
		<Button label="Default Button" />
	</View>
);

export const Secondary = () => (
	<View style={{ padding: 20 }}>
		<Button variant="secondary" label="Secondary Button" />
	</View>
);
