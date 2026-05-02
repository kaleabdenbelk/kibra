import { cn } from "{{UTILS_ALIAS}}";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

const buttonVariants = cva(
	"flex-row items-center justify-center rounded-md px-4 py-2 active:opacity-80",
	{
		variants: {
			variant: {
				default: "bg-primary",
				secondary: "bg-slate-100 dark:bg-slate-800",
				outline: "border border-slate-200 bg-transparent dark:border-slate-700",
				ghost: "bg-transparent",
				danger: "bg-red-500",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

interface ButtonProps
	extends React.ComponentPropsWithoutRef<typeof Pressable>,
		VariantProps<typeof buttonVariants> {
	label?: string;
	labelClasses?: string;
	loading?: boolean;
	className?: string;
	children?: React.ReactNode;
}

function Button({
	className,
	variant,
	size,
	label,
	labelClasses,
	loading,
	children,
	...props
}: ButtonProps) {
	return (
		<Pressable
			className={cn(buttonVariants({ variant, size, className }))}
			accessibilityRole="button"
			accessibilityState={{
				disabled: !!props.disabled || !!loading,
				busy: !!loading,
			}}
			accessibilityLabel={props.accessibilityLabel || label}
			{...props}
		>
			{loading ? (
				<ActivityIndicator
					color={variant === "default" ? "white" : "black"}
					accessibilityLabel="Loading"
				/>
			) : (
				<>
					{label && (
						<Text
							className={cn(
								"text-sm font-medium",
								variant === "default"
									? "text-white"
									: "text-black dark:text-white",
								labelClasses,
							)}
						>
							{label}
						</Text>
					)}
					{children}
				</>
			)}
		</Pressable>
	);
}

export { Button, buttonVariants };
