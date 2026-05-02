import React from "react";
import { Text, View } from "react-native";
import { cn } from "../lib/utils";

function Card({ className, ...props }) {
	return (
		<View
			className={cn(
				"rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950",
				className,
			)}
			{...props}
		/>
	);
}
function CardHeader({ className, ...props }) {
	return (
		<View
			className={cn("flex flex-col space-y-1.5 pb-4", className)}
			{...props}
		/>
	);
}
function CardTitle({ className, ...props }) {
	return (
		<Text
			className={cn(
				"text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50",
				className,
			)}
			{...props}
		/>
	);
}
function CardDescription({ className, ...props }) {
	return (
		<Text
			className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
			{...props}
		/>
	);
}
function CardContent({ className, ...props }) {
	return <View className={cn("pt-0", className)} {...props} />;
}
function CardFooter({ className, ...props }) {
	return (
		<View
			className={cn("flex flex-row items-center pt-4", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
