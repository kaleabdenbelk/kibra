export const COMPONENT_TEMPLATES: Record<string, { filename: string; content: string }> = {
  button: {
    filename: 'Button.tsx',
    content: `import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../lib/utils'; // Assuming a utils file exists or will be created

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md px-4 py-2 active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-slate-100 dark:bg-slate-800',
        outline: 'border border-slate-200 bg-transparent dark:border-slate-700',
        ghost: 'bg-transparent',
        danger: 'bg-red-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  labelClasses?: string;
  loading?: boolean;
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
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'default' ? 'white' : 'black'} />
      ) : (
        <>
          {label && (
            <Text
              className={cn(
                'text-sm font-medium',
                variant === 'default' ? 'text-white' : 'text-black dark:text-white',
                labelClasses
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
`,
  },
  card: {
    filename: 'Card.tsx',
    content: `import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../lib/utils';

function Card({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return (
    <View
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      className={cn('text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('flex flex-row items-center pt-4', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`,
  },
  input: {
    filename: 'Input.tsx',
    content: `import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '../lib/utils';

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
            'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <Text className="text-xs text-red-500">
            {error}
          </Text>
        )}
      </View>
    );
  }
);
Input.displayName = 'Input';

export { Input };
`,
  },
};

export const UTILS_TEMPLATE = {
  filename: 'lib/utils.ts',
  content: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
};
