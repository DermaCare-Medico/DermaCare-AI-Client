"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type Props = {
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
};

const NPassword = ({ name, label, placeholder, required, minLength }: Props) => {
    const { control } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <div className="flex flex-col mb-4 w-full">
                    <label htmlFor={name} className="mb-1 font-medium text-sm">
                        {label}
                    </label>
                    <div className="relative">
                        <Input
                            id={name}
                            type={showPassword ? "text" : "password"}
                            placeholder={placeholder || "Enter your password"}
                            required={required}
                            minLength={minLength}
                            {...field}
                            className="pr-10 py-6"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                </div>
            )}
        />
    );
};

export default NPassword;
