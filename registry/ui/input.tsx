import { cn } from "{{UTILS_ALIAS}}";
import React from "react";
import { Text, TextInput, View } from "react-native";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
	label?: string;
	error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
	({ className, label, error, ...props }, ref) => {
		return (
			<View className="w-full space-y-2">
				{label && (
					<Text className="text-sm font-medium text-slate-900 dark:text-slate-50">
						{label}
					</Text>
				)}
				<TextInput
					ref={ref}
					className={cn(
						"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400",
						error && "border-red-500",
						className,
					)}
					accessibilityLabel={props.accessibilityLabel || label}
					accessibilityHint={props.accessibilityHint || error}
					{...props}
				/>
				{error && <Text className="text-xs text-red-500">{error}</Text>}
			</View>
		);
	},
);
Input.displayName = "Input";

export { Input };
