import { cn } from "{{UTILS_ALIAS}}";
import React, { useEffect } from "react";
import {
	BackHandler,
	Modal as RNModal,
	Pressable,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	SlideInBottom,
	SlideOutBottom,
} from "react-native-reanimated";

interface ModalProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}

/**
 * Elite Modal component for Kibra.
 * Includes: 
 * - Smooth Reanimated transitions
 * - A11y roles and focus management via RN Modal
 * - Backdrop click-to-close
 * - Hardware back button handling
 */
export function Modal({
	visible,
	onClose,
	title,
	description,
	children,
	className,
}: ModalProps) {
	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				if (visible) {
					onClose();
					return true;
				}
				return false;
			},
		);

		return () => backHandler.remove();
	}, [visible, onClose]);

	return (
		<RNModal
			transparent
			visible={visible}
			onRequestClose={onClose}
			animationType="none" // We use Reanimated for custom transitions
		>
			<View className="flex-1 justify-end sm:justify-center">
				{/* Backdrop */}
				<Animated.View
					entering={FadeIn}
					exiting={FadeOut}
					className="absolute inset-0 bg-black/50"
				>
					<Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close modal" />
				</Animated.View>

				{/* Modal Content */}
				<Animated.View
					entering={SlideInBottom}
					exiting={SlideOutBottom}
					className={cn(
						"bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-xl",
						className,
					)}
					accessibilityRole="alert"
					aria-modal="true"
				>
					<View className="flex-col space-y-2 mb-4">
						{title && (
							<Text className="text-xl font-bold text-slate-900 dark:text-slate-50" accessibilityRole="header">
								{title}
							</Text>
						)}
						{description && (
							<Text className="text-sm text-slate-500 dark:text-slate-400">
								{description}
							</Text>
						)}
					</View>

					<View>{children}</View>
				</Animated.View>
			</View>
		</RNModal>
	);
}
