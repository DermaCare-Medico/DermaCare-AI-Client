import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
    type: string;
    name: string;
    placeholder: string;
    label?: string;
    required?: boolean;
};

const NInput = ({ type, name, placeholder, label, required }: Props) => {
    const { control } = useFormContext();


    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <div className="flex flex-col mb-4 w-full">
                    {label && (
                        <label htmlFor={name} className="mb-1 font-medium text-sm">
                            {label}
                        </label>
                    )}

                    <Input
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        className="py-5 w-full"
                        required={required}
                        {...field}
                    />

                    {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default NInput;
