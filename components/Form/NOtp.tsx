import { Controller, useFormContext } from "react-hook-form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

type Props = {
    name: string;
    label?: string;
    maxLength?: number;
};

const NOtp = ({ name, label, maxLength = 6 }: Props) => {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: "Enter the verification code.",
                minLength: {
                    value: maxLength,
                    message: `Enter all ${maxLength} digits.`,
                },
            }}
            render={({ field, fieldState }) => (
                <div className="mb-4 flex w-full flex-col">
                    {label && (
                        <label className="mb-2 text-sm font-semibold text-[#26384A]">
                            {label}
                        </label>
                    )}
                    <InputOTP
                        maxLength={maxLength}
                        pattern="[0-9]*"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-invalid={fieldState.invalid}
                        aria-label={label ?? "Verification code"}
                    >
                        <InputOTPGroup className="gap-2">
                            {Array.from({ length: maxLength }, (_, index) => (
                                <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="size-12 rounded-lg border border-[#DCE4EC] text-base text-[#163A5F] first:border-l focus-within:border-[#0F888D] data-[active=true]:border-[#0F888D] data-[active=true]:ring-[#0F888D]/20"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                    {fieldState.error && (
                        <p className="mt-2 text-sm text-red-500">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
};

export default NOtp;